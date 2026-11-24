import type { Page } from '@playwright/test';

import { ROW_HEIGHT, columnWidth, layout } from './pinnedStartEndData';

/**
 * Checks of the pinned-start-end* pages, shared by their specs.
 *
 * `getLayoutErrors` computes where every column and row should be for the
 * current scroll position - from the column widths and the pinning, not from
 * the DOM - and returns what does not match:
 *
 * - every rendered body cell and header cell: position and size;
 * - every rendered body cell: its text (it belongs to its row and column);
 * - hit testing: for every visible slot of every visible row, the element
 *   on top at the middle of the slot is the cell of that row and column -
 *   so pinned cells are drawn over the unpinned ones scrolled under them,
 *   and nothing is missing;
 * - the same for the header.
 *
 * An empty array means the layout is right.
 */

const model = {
  rowHeight: ROW_HEIGHT,
  start: layout.start,
  unpinned: layout.unpinned,
  end: layout.end,
  widths: Object.fromEntries(
    [...layout.start, ...layout.unpinned, ...layout.end].map((id) => [
      id,
      columnWidth(id),
    ]),
  ),
};

export type LayoutOptions = {
  /** also check the column group header cells (pinned-start-end-column-groups) */
  withGroups?: boolean;
  /** the Infinite root to check, when there's more than one in the page */
  rootSelector?: string;
};

export async function getLayoutErrors(
  page: Page,
  options: LayoutOptions = {},
): Promise<string[]> {
  return page.evaluate(
    ({ model, options }) => {
      const errors: string[] = [];
      const TOLERANCE = 1;
      const close = (a: number, b: number) => Math.abs(a - b) <= TOLERANCE;
      const fmt = (n: number) => Math.round(n * 10) / 10;

      const root = document.querySelector<HTMLElement>(
        options.rootSelector ?? '.Infinite',
      );
      if (!root) {
        return ['no grid in the page'];
      }
      const scroller = root.querySelector<HTMLElement>(
        '.InfiniteVirtualScrollContainer',
      );
      if (!scroller) {
        return ['no scroll container'];
      }

      const scrollerRect = scroller.getBoundingClientRect();
      const body = {
        left: scrollerRect.left + scroller.clientLeft,
        top: scrollerRect.top + scroller.clientTop,
        width: scroller.clientWidth,
        height: scroller.clientHeight,
      };
      const { scrollLeft, scrollTop } = scroller;

      // the body is inside the grid - not somewhere else in the page
      const rootRect = root.getBoundingClientRect();
      if (
        body.left < rootRect.left - TOLERANCE ||
        body.top < rootRect.top - TOLERANCE ||
        body.left + body.width > rootRect.right + TOLERANCE ||
        body.top + body.height > rootRect.bottom + TOLERANCE
      ) {
        errors.push(
          `the body (${fmt(body.left)}, ${fmt(body.top)} ${body.width}x${
            body.height
          }) is not inside the grid (${fmt(rootRect.left)}, ${fmt(
            rootRect.top,
          )} ${fmt(rootRect.width)}x${fmt(rootRect.height)})`,
        );
      }

      const width = (id: string) => model.widths[id] as number;
      const sum = (ids: string[]) => ids.reduce((s, id) => s + width(id), 0);
      const startWidth = sum(model.start);
      const endWidth = sum(model.end);

      // where each column is (screen x) and which part of it can be seen
      type Slot = {
        id: string;
        x: number;
        visibleFrom: number;
        visibleTo: number;
        area: 'start' | 'unpinned' | 'end';
      };
      const slots = new Map<string, Slot>();
      let x = body.left;
      model.start.forEach((id: string) => {
        slots.set(id, {
          id,
          x,
          visibleFrom: x,
          visibleTo: x + width(id),
          area: 'start',
        });
        x += width(id);
      });
      const unpinnedFrom = body.left + startWidth;
      const unpinnedTo = body.left + body.width - endWidth;
      x = unpinnedFrom - scrollLeft;
      model.unpinned.forEach((id: string) => {
        slots.set(id, {
          id,
          x,
          visibleFrom: Math.max(x, unpinnedFrom),
          visibleTo: Math.min(x + width(id), unpinnedTo),
          area: 'unpinned',
        });
        x += width(id);
      });
      x = body.left + body.width - endWidth;
      model.end.forEach((id: string) => {
        slots.set(id, {
          id,
          x,
          visibleFrom: x,
          visibleTo: x + width(id),
          area: 'end',
        });
        x += width(id);
      });

      const rowTop = (rowIndex: number) =>
        body.top + rowIndex * model.rowHeight - scrollTop;

      // 1. every rendered body cell
      const cells = Array.from(
        root.querySelectorAll<HTMLElement>(
          '.InfiniteColumnCell[data-column-id]:not(.InfiniteDetachedCell)',
        ),
      );
      if (!cells.length) {
        errors.push('no body cells');
      }
      cells.forEach((cell) => {
        const id = cell.dataset.columnId!;
        const rowIndex = Number(cell.dataset.rowIndex);
        const slot = slots.get(id);
        if (!slot) {
          errors.push(`body cell of unknown column ${id}`);
          return;
        }
        const rect = cell.getBoundingClientRect();
        const where = `body cell ${id} row ${rowIndex}`;
        if (!close(rect.left, slot.x) || !close(rect.width, width(id))) {
          errors.push(
            `${where}: x ${fmt(rect.left)} w ${fmt(
              rect.width,
            )}, expected x ${fmt(slot.x)} w ${width(id)}`,
          );
        }
        if (
          !close(rect.top, rowTop(rowIndex)) ||
          !close(rect.height, model.rowHeight)
        ) {
          errors.push(
            `${where}: y ${fmt(rect.top)} h ${fmt(
              rect.height,
            )}, expected y ${fmt(rowTop(rowIndex))} h ${model.rowHeight}`,
          );
        }
        const expectedText = `r${rowIndex}·${id}`;
        if (cell.textContent !== expectedText) {
          errors.push(
            `${where}: text "${cell.textContent}", expected "${expectedText}"`,
          );
        }
        const pinnedClass = cell.className.match(
          /InfiniteColumnCell--(pinned-start|pinned-end|unpinned)/,
        )?.[1];
        const expectedClass =
          slot.area === 'start'
            ? 'pinned-start'
            : slot.area === 'end'
            ? 'pinned-end'
            : 'unpinned';
        if (pinnedClass !== expectedClass) {
          errors.push(
            `${where}: pinned class ${pinnedClass}, expected ${expectedClass}`,
          );
        }
      });

      // 2. every rendered header cell (the header keeps detached cells in
      // its pool too - hidden, wherever they were)
      const headerCells = Array.from(
        root.querySelectorAll<HTMLElement>(
          '.InfiniteHeaderCell[data-column-id]:not(.InfiniteDetachedCell)',
        ),
      );
      if (!headerCells.length) {
        errors.push('no header cells');
      }
      const headerRect = headerCells[0]?.getBoundingClientRect();
      headerCells.forEach((cell) => {
        const id = cell.dataset.columnId!;
        const slot = slots.get(id);
        if (!slot) {
          errors.push(`header cell of unknown column ${id}`);
          return;
        }
        const rect = cell.getBoundingClientRect();
        if (!close(rect.left, slot.x) || !close(rect.width, width(id))) {
          errors.push(
            `header cell ${id}: x ${fmt(rect.left)} w ${fmt(
              rect.width,
            )}, expected x ${fmt(slot.x)} w ${width(id)}`,
          );
        }
        if (rect.bottom > body.top + TOLERANCE) {
          errors.push(
            `header cell ${id}: bottom ${fmt(
              rect.bottom,
            )} is below the body top ${fmt(body.top)}`,
          );
        }
      });

      // 3. column group header cells span their visible columns
      if (options.withGroups) {
        const groupCells = Array.from(
          root.querySelectorAll<HTMLElement>('[data-group-id]'),
        );
        if (!groupCells.length) {
          errors.push('no column group header cells');
        }
        groupCells.forEach((groupCell) => {
          // data-group-id is the group id followed by the ids of the
          // columns it spans: "outer,c1,c2,c4,c5" - a group split by
          // pinning has one header cell per part
          const [groupId, ...leafIds] = groupCell.dataset.groupId!.split(',');
          if (!leafIds.length) {
            errors.push(`group header ${groupId}: no columns in its id`);
            return;
          }
          if (leafIds.some((id) => !slots.has(id))) {
            errors.push(`group header ${groupId}: unknown columns ${leafIds}`);
            return;
          }
          const groupSlots = leafIds.map((id) => slots.get(id)!);
          const left = Math.min(...groupSlots.map((s) => s.x));
          const right = Math.max(...groupSlots.map((s) => s.x + width(s.id)));
          if (
            groupSlots.every((s) => s.area === 'unpinned') &&
            (right <= unpinnedFrom || left >= unpinnedTo)
          ) {
            // scrolled out of view: the header doesn't update it until it
            // is in range again (it can't be seen)
            return;
          }
          const rect = groupCell.getBoundingClientRect();
          if (!close(rect.left, left) || !close(rect.right, right)) {
            errors.push(
              `group header ${groupId}: x ${fmt(rect.left)}-${fmt(
                rect.right,
              )}, expected ${fmt(left)}-${fmt(right)} (columns ${leafIds.join(
                ',',
              )})`,
            );
          }
        });
      }

      // 4. hit testing - the element on top at the middle of every visible
      // slot of every visible row (and of the header). Visible = in the
      // viewport and not clipped by a scrolling ancestor of the grid.
      const clip = {
        left: 0,
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
      };
      for (
        let node = root.parentElement;
        node && node !== document.documentElement;
        node = node.parentElement
      ) {
        if (getComputedStyle(node).overflow === 'visible') {
          continue;
        }
        const rect = node.getBoundingClientRect();
        clip.left = Math.max(clip.left, rect.left + node.clientLeft);
        clip.top = Math.max(clip.top, rect.top + node.clientTop);
        clip.right = Math.min(
          clip.right,
          rect.left + node.clientLeft + node.clientWidth,
        );
        clip.bottom = Math.min(
          clip.bottom,
          rect.top + node.clientTop + node.clientHeight,
        );
      }
      const visibleX = (x: number) => x > clip.left + 1 && x < clip.right - 1;
      const visibleY = (y: number) => y > clip.top + 1 && y < clip.bottom - 1;
      const firstRow = Math.floor(scrollTop / model.rowHeight);
      const lastRow = Math.floor(
        (scrollTop + body.height - 1) / model.rowHeight,
      );
      const visibleSlots = Array.from(slots.values()).filter(
        (slot) => slot.visibleTo - slot.visibleFrom >= 4,
      );
      for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
        const top = Math.max(rowTop(rowIndex), body.top);
        const bottom = Math.min(
          rowTop(rowIndex) + model.rowHeight,
          body.top + body.height,
        );
        if (bottom - top < 4) {
          continue;
        }
        const y = (top + bottom) / 2;
        if (!visibleY(y)) {
          continue;
        }
        visibleSlots.forEach((slot) => {
          const x = (slot.visibleFrom + slot.visibleTo) / 2;
          if (!visibleX(x)) {
            return;
          }
          const hit = document
            .elementFromPoint(x, y)
            ?.closest<HTMLElement>('.InfiniteColumnCell');
          if (
            !hit ||
            hit.dataset.columnId !== slot.id ||
            Number(hit.dataset.rowIndex) !== rowIndex
          ) {
            errors.push(
              `hit test row ${rowIndex} column ${slot.id} at (${fmt(x)}, ${fmt(
                y,
              )}): got ${
                hit
                  ? `${hit.dataset.columnId} row ${hit.dataset.rowIndex}`
                  : 'no cell'
              }`,
            );
          }
        });
      }
      if (headerRect) {
        // just above the body: with column groups, the header cells of the
        // columns have different heights, but they all end at the body
        const y = body.top - 6;
        // the resize handle of a header cell overlaps the next cell by a
        // few pixels, so slivers of header cells are not hit tested
        visibleSlots
          .filter(
            (slot) =>
              slot.visibleTo - slot.visibleFrom >= 16 &&
              visibleY(y) &&
              visibleX((slot.visibleFrom + slot.visibleTo) / 2),
          )
          .forEach((slot) => {
            const x = (slot.visibleFrom + slot.visibleTo) / 2;
            const hit = document
              .elementFromPoint(x, y)
              ?.closest<HTMLElement>('.InfiniteHeaderCell[data-column-id]');
            if (!hit || hit.dataset.columnId !== slot.id) {
              errors.push(
                `header hit test column ${slot.id} at (${fmt(x)}, ${fmt(
                  y,
                )}): got ${hit ? hit.dataset.columnId : 'no header cell'}`,
              );
            }
          });
      }

      return errors;
    },
    { model, options },
  );
}

/**
 * Scrolls the grid through its API and waits until the layout is right -
 * horizontal positions are applied after the cells render, and some work
 * happens when scrolling stops, so the checks poll.
 */
export async function scrollGridTo(
  page: Page,
  position: { scrollLeft?: number; scrollTop?: number },
) {
  await page.evaluate((position) => {
    const api = (globalThis as any).api;
    if (position.scrollLeft != null) {
      api.scrollLeft = position.scrollLeft;
    }
    if (position.scrollTop != null) {
      api.scrollTop = position.scrollTop;
    }
  }, position);
}

export async function getScrollMax(page: Page, rootSelector = '.Infinite') {
  return page.evaluate((rootSelector) => {
    const scroller = document
      .querySelector(rootSelector)!
      .querySelector<HTMLElement>('.InfiniteVirtualScrollContainer')!;
    return {
      scrollLeftMax: scroller.scrollWidth - scroller.clientWidth,
      scrollTopMax: scroller.scrollHeight - scroller.clientHeight,
    };
  }, rootSelector);
}

export async function getScrollPosition(
  page: Page,
  rootSelector = '.Infinite',
) {
  return page.evaluate((rootSelector) => {
    const scroller = document
      .querySelector(rootSelector)!
      .querySelector<HTMLElement>('.InfiniteVirtualScrollContainer')!;
    return {
      scrollLeft: scroller.scrollLeft,
      scrollTop: scroller.scrollTop,
    };
  }, rootSelector);
}

/** the scroll positions every layout test goes through */
export function getScrollPositions(max: {
  scrollLeftMax: number;
  scrollTopMax: number;
}) {
  const lefts = [
    0,
    1,
    137,
    Math.round(max.scrollLeftMax / 2),
    max.scrollLeftMax - 1,
    max.scrollLeftMax,
  ];
  const tops = [0, 333, Math.round(max.scrollTopMax / 2), max.scrollTopMax];
  return tops.flatMap((scrollTop) =>
    lefts.map((scrollLeft) => ({ scrollLeft, scrollTop })),
  );
}
