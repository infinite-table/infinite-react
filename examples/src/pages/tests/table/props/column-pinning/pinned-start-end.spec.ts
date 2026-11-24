import { test, expect } from '@testing';

import {
  getLayoutErrors,
  getScrollMax,
  getScrollPosition,
  getScrollPositions,
  scrollGridTo,
} from './pinnedStartEndChecks';
import { ROW_HEIGHT, layout } from './pinnedStartEndData';

const POLL = { timeout: 3000 };

export default test.describe('Columns pinned at the start and at the end', () => {
  test.beforeEach(async () => {
    // many scroll positions, each one waiting for the layout to settle
    test.setTimeout(60_000);
  });

  test('cells and header cells are in place and on top, at every scroll position', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);

    const max = await getScrollMax(page);
    expect(max.scrollLeftMax).toBeGreaterThan(1000);
    expect(max.scrollTopMax).toBeGreaterThan(10_000);

    for (const position of getScrollPositions(max)) {
      await scrollGridTo(page, position);
      await expect.poll(() => getScrollPosition(page), POLL).toEqual(position);
      await expect
        .poll(
          async () => [
            `scrollLeft ${position.scrollLeft} scrollTop ${position.scrollTop}`,
            ...(await getLayoutErrors(page)),
          ],
          POLL,
        )
        .toEqual([
          `scrollLeft ${position.scrollLeft} scrollTop ${position.scrollTop}`,
        ]);
    }
  });

  test('pinned cells do not move, and rows stay aligned, while scrolling with the wheel', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await page.evaluate(() => {
      const frames: {
        scrollLeft: number;
        pinned: Record<string, number>;
        rowTops: Record<string, number[]>;
      }[] = [];
      const root = document.querySelector('.Infinite')!;
      const scroller = root.querySelector<HTMLElement>(
        '.InfiniteVirtualScrollContainer',
      )!;
      // Measured in a ResizeObserver callback: those run after all the
      // requestAnimationFrame callbacks of a frame (the grid moves its scroll
      // layer in one) and after layout, right before paint - so this is what
      // gets painted. A rAF callback of ours could run before the grid's.
      const probe = document.createElement('div');
      probe.style.cssText =
        'position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none';
      document.body.appendChild(probe);
      let stopped = false;
      let toggle = false;
      const tick = () => {
        if (stopped) {
          return;
        }
        // a size change every frame, so the observer runs every frame
        toggle = !toggle;
        probe.style.width = toggle ? '2px' : '1px';
        requestAnimationFrame(tick);
      };
      const record = () => {
        if (stopped) {
          return;
        }
        const pinned: Record<string, number> = {};
        const rowTops: Record<string, number[]> = {};
        root
          .querySelectorAll<HTMLElement>(
            '.InfiniteColumnCell[data-column-id]:not(.InfiniteDetachedCell)',
          )
          .forEach((cell) => {
            const rect = cell.getBoundingClientRect();
            const rowIndex = cell.dataset.rowIndex!;
            (rowTops[rowIndex] = rowTops[rowIndex] || []).push(rect.top);
            if (/InfiniteColumnCell--pinned-(start|end)/.test(cell.className)) {
              // pinned cells: x never changes, whatever the row
              pinned[`body ${cell.dataset.columnId}`] = rect.left;
            }
          });
        frames.push({ scrollLeft: scroller.scrollLeft, pinned, rowTops });
      };
      new ResizeObserver(record).observe(probe);
      requestAnimationFrame(tick);
      (globalThis as any).stopRecording = () => {
        stopped = true;
        return frames;
      };
    });

    const box = (await page
      .locator('.InfiniteVirtualScrollContainer')
      .boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    for (let i = 0; i < 15; i++) {
      await page.mouse.wheel(90, 0);
      await page.waitForTimeout(16);
    }
    for (let i = 0; i < 15; i++) {
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(16);
    }
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(-70, 70);
      await page.waitForTimeout(16);
    }
    await page.waitForTimeout(400);

    const frames: {
      scrollLeft: number;
      pinned: Record<string, number>;
      rowTops: Record<string, number[]>;
    }[] = await page.evaluate(() => (globalThis as any).stopRecording());

    expect(frames.length).toBeGreaterThan(20);
    // the gesture did scroll horizontally
    expect(Math.max(...frames.map((f) => f.scrollLeft))).toBeGreaterThan(300);

    const problems: string[] = [];
    const firstLeft: Record<string, number> = {};
    frames.forEach((frame, index) => {
      Object.entries(frame.pinned).forEach(([key, left]) => {
        if (firstLeft[key] === undefined) {
          firstLeft[key] = left;
        } else if (Math.abs(firstLeft[key] - left) > 0.5) {
          problems.push(
            `frame ${index} (scrollLeft ${frame.scrollLeft}): ${key} at x ${left}, was ${firstLeft[key]}`,
          );
        }
      });
      Object.entries(frame.rowTops).forEach(([rowIndex, tops]) => {
        if (Math.max(...tops) - Math.min(...tops) > 0.5) {
          problems.push(
            `frame ${index}: the cells of row ${rowIndex} are at different heights (${Math.min(
              ...tops,
            )}-${Math.max(...tops)})`,
          );
        }
      });
    });
    expect(problems.slice(0, 10)).toEqual([]);
    expect(Object.keys(firstLeft).sort()).toEqual(
      [...layout.start, ...layout.end].map((id) => `body ${id}`).sort(),
    );

    await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);
  });

  test('the wheel scrolls the grid when the pointer is over a pinned area', async ({
    page,
  }) => {
    await page.waitForInfinite();

    const box = (await page
      .locator('.InfiniteVirtualScrollContainer')
      .boundingBox())!;
    const y = box.y + box.height / 2;

    // over the pinned start columns
    await page.mouse.move(box.x + 40, y);
    await page.mouse.wheel(0, 600);
    await page.mouse.wheel(300, 0);
    await expect
      .poll(() => getScrollPosition(page), POLL)
      .toEqual({ scrollLeft: 300, scrollTop: 600 });
    await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);

    // over the pinned end columns
    await page.mouse.move(box.x + box.width - 40, y);
    await page.mouse.wheel(0, 900);
    await page.mouse.wheel(250, 0);
    await expect
      .poll(() => getScrollPosition(page), POLL)
      .toEqual({ scrollLeft: 550, scrollTop: 1500 });
    await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);
  });

  test('hovering a pinned cell highlights its whole row, and only that row', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await scrollGridTo(page, { scrollLeft: 400, scrollTop: 10 * ROW_HEIGHT });
    await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);

    const hoveredRows = () =>
      page.evaluate(() => {
        const rows = new Map<string, { hovered: number; total: number }>();
        document
          .querySelectorAll<HTMLElement>(
            '.InfiniteColumnCell[data-column-id]:not(.InfiniteDetachedCell)',
          )
          .forEach((cell) => {
            const info = rows.get(cell.dataset.rowIndex!) || {
              hovered: 0,
              total: 0,
            };
            info.total++;
            if (cell.classList.contains('InfiniteColumnCell--hovered')) {
              info.hovered++;
            }
            rows.set(cell.dataset.rowIndex!, info);
          });
        return Array.from(rows.entries())
          .filter(([, info]) => info.hovered > 0)
          .map(
            ([rowIndex, info]) => `${rowIndex}: ${info.hovered}/${info.total}`,
          );
      });

    for (const columnId of [
      layout.end[1],
      layout.start[0],
      layout.unpinned[5],
    ]) {
      const cell = page.locator(
        `.InfiniteColumnCell[data-column-id="${columnId}"][data-row-index="13"]`,
      );
      const box = (await cell.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

      await expect
        .poll(async () => {
          const rows = await hoveredRows();
          return rows.length === 1 && rows[0].startsWith('13: ')
            ? rows[0].split(': ')[1].split('/')[0] === rows[0].split('/')[1]
            : rows;
        }, POLL)
        .toBe(true);
    }
  });

  test('the active cell indicator covers the active cell, in pinned and unpinned columns', async ({
    page,
  }) => {
    await page.waitForInfinite();

    const indicatorMatchesCell = (columnId: string, rowIndex: number) =>
      page.evaluate(
        ({ columnId, rowIndex }) => {
          const indicator = document.querySelector<HTMLElement>(
            '[data-name="active-cell-indicator"]',
          );
          const cell = document.querySelector<HTMLElement>(
            `.InfiniteColumnCell[data-column-id="${columnId}"][data-row-index="${rowIndex}"]`,
          );
          if (!indicator || !cell) {
            return `missing ${!indicator ? 'indicator' : 'cell'}`;
          }
          const a = indicator.getBoundingClientRect();
          const b = cell.getBoundingClientRect();
          // the indicator is drawn inside the cell border
          const same = (x: number, y: number) => Math.abs(x - y) <= 1.5;
          return same(a.left, b.left) &&
            same(a.top, b.top) &&
            same(a.right, b.right) &&
            same(a.bottom, b.bottom)
            ? 'ok'
            : `indicator ${[a.left, a.top, a.width, a.height].map(
                Math.round,
              )} cell ${[b.left, b.top, b.width, b.height].map(Math.round)}`;
        },
        { columnId, rowIndex },
      );

    const clickCell = async (columnId: string, rowIndex: number) => {
      await page
        .locator(
          `.InfiniteColumnCell[data-column-id="${columnId}"][data-row-index="${rowIndex}"]`,
        )
        .click();
    };

    // a pinned end cell, then scrolled horizontally: it stays under the indicator
    await clickCell('c19', 3);
    await expect.poll(() => indicatorMatchesCell('c19', 3), POLL).toBe('ok');
    await scrollGridTo(page, { scrollLeft: 500 });
    await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);
    await expect.poll(() => indicatorMatchesCell('c19', 3), POLL).toBe('ok');

    // an unpinned cell, then scrolled: the indicator moves with it
    const unpinnedId = await page.evaluate(() => {
      const scroller = document.querySelector<HTMLElement>(
        '.InfiniteVirtualScrollContainer',
      )!;
      const rect = scroller.getBoundingClientRect();
      const hit = document
        .elementFromPoint(rect.left + rect.width / 2, rect.top + 100)
        ?.closest<HTMLElement>('.InfiniteColumnCell');
      return hit!.dataset.columnId!;
    });
    expect(layout.unpinned).toContain(unpinnedId);
    await clickCell(unpinnedId, 2);
    await expect
      .poll(() => indicatorMatchesCell(unpinnedId, 2), POLL)
      .toBe('ok');
    await scrollGridTo(page, { scrollLeft: 540 });
    await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);
    await expect
      .poll(() => indicatorMatchesCell(unpinnedId, 2), POLL)
      .toBe('ok');

    // keyboard: from the last pinned start column into the unpinned ones,
    // which scrolls back to the start
    await clickCell(layout.start[1], 4);
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => indicatorMatchesCell(layout.unpinned[0], 4), POLL)
      .toBe('ok');
    await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);

    // and from the last unpinned column into the pinned end ones
    await scrollGridTo(page, { scrollLeft: 100_000 });
    await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);
    const lastUnpinned = layout.unpinned[layout.unpinned.length - 1];
    await clickCell(lastUnpinned, 5);
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => indicatorMatchesCell(layout.end[0], 5), POLL)
      .toBe('ok');
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => indicatorMatchesCell(layout.end[1], 5), POLL)
      .toBe('ok');
  });

  test('resizing the grid keeps the pinned columns at its edges', async ({
    page,
  }) => {
    await page.waitForInfinite();

    for (const [width, height] of [
      [700, 360],
      [1150, 480],
      [900, 420],
    ]) {
      await page.evaluate(
        ([width, height]) => (globalThis as any).setGridSize(width, height),
        [width, height],
      );
      await expect
        .poll(
          () =>
            page.evaluate(
              () =>
                document.querySelector('.Infinite')!.getBoundingClientRect()
                  .width,
            ),
          POLL,
        )
        .toBe(width);

      const max = await getScrollMax(page);
      for (const position of [
        { scrollLeft: 0, scrollTop: 0 },
        { scrollLeft: max.scrollLeftMax, scrollTop: max.scrollTopMax },
      ]) {
        await scrollGridTo(page, position);
        await expect
          .poll(() => getScrollPosition(page), POLL)
          .toEqual(position);
        await expect.poll(() => getLayoutErrors(page), POLL).toEqual([]);
      }
    }
  });
});
