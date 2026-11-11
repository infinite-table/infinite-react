import { expect, Page } from '@playwright/test';

/**
 * Helpers for the very-large-content specs: content bigger than what the
 * browser can lay out, so the grid maps the (capped) scroll container onto
 * the content and keeps DOM offsets relative to a scroll origin.
 * See source/src/components/VirtualBrain/largeContent.ts
 */

export type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
};

export async function getBody(page: Page) {
  return page.evaluate(() => {
    const scroller = document.querySelector(
      '.InfiniteVirtualScrollContainer',
    ) as HTMLElement;
    const rect = scroller.getBoundingClientRect();
    const top = rect.top + scroller.clientTop;
    const left = rect.left + scroller.clientLeft;
    return {
      top,
      left,
      width: scroller.clientWidth,
      height: scroller.clientHeight,
      bottom: top + scroller.clientHeight,
      right: left + scroller.clientWidth,
      nativeScrollHeight: scroller.scrollHeight,
      nativeScrollWidth: scroller.scrollWidth,
    };
  });
}

/**
 * rect + text of the attached cell for the given row & column, or null
 */
export async function getCell(page: Page, rowIndex: number, columnId: string) {
  return page.evaluate(
    ([rowIndex, columnId]) => {
      const cell = document.querySelector(
        `.InfiniteColumnCell:not(.InfiniteDetachedCell)[data-row-index="${rowIndex}"][data-column-id="${columnId}"]`,
      ) as HTMLElement | null;
      if (!cell) {
        return null;
      }
      const r = cell.getBoundingClientRect();
      return {
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        bottom: r.bottom,
        right: r.right,
        text: (cell.textContent || '').trim(),
      };
    },
    [rowIndex, columnId] as const,
  );
}

export async function getContentScrollPosition(page: Page) {
  return page.evaluate(() => {
    const api = (window as any).INFINITE_GRID_API;
    return {
      scrollTop: api.scrollTop as number,
      scrollLeft: api.scrollLeft as number,
      scrollTopMax: api.scrollTopMax as number,
      scrollLeftMax: api.scrollLeftMax as number,
    };
  });
}

export async function setContentScroll(
  page: Page,
  scroll: { scrollTop?: number; scrollLeft?: number },
) {
  await page.evaluate((scroll) => {
    const api = (window as any).INFINITE_GRID_API;
    if (scroll.scrollTop !== undefined) {
      api.scrollTop = scroll.scrollTop;
    }
    if (scroll.scrollLeft !== undefined) {
      api.scrollLeft = scroll.scrollLeft;
    }
  }, scroll);
}

/**
 * Waits until `check` passes - the grid renders the new rows asynchronously
 * (and in horizontal layout, positions are applied after the content is
 * committed).
 */
export async function eventually(check: () => Promise<void>) {
  await expect(check).toPass({ timeout: 5_000, intervals: [50, 100, 250] });
}

/**
 * Sets the content scroll position and checks it was really reached - the
 * native scroll container is shorter than the content, so without the
 * mapping the browser would just clamp it.
 *
 * One native px is `ratio` content px, so that's the precision we can get.
 */
export async function scrollToAndCheck(
  page: Page,
  scroll: { scrollTop?: number; scrollLeft?: number },
) {
  await setContentScroll(page, scroll);

  const body = await getBody(page);
  const position = await getContentScrollPosition(page);

  const tolerance = (
    contentMax: number,
    nativeSize: number,
    viewport: number,
  ) => Math.max(1, contentMax / Math.max(1, nativeSize - viewport)) + 1;

  await eventually(async () => {
    const current = await getContentScrollPosition(page);
    if (scroll.scrollTop !== undefined) {
      expectClose(
        current.scrollTop,
        Math.min(scroll.scrollTop, position.scrollTopMax),
        tolerance(position.scrollTopMax, body.nativeScrollHeight, body.height),
      );
    }
    if (scroll.scrollLeft !== undefined) {
      expectClose(
        current.scrollLeft,
        Math.min(scroll.scrollLeft, position.scrollLeftMax),
        tolerance(position.scrollLeftMax, body.nativeScrollWidth, body.width),
      );
    }
  });
}

export function expectClose(actual: number, expected: number, delta = 1.5) {
  expect(
    Math.abs(actual - expected),
    `expected ${actual} to be within ${delta}px of ${expected}`,
  ).toBeLessThanOrEqual(delta);
}
