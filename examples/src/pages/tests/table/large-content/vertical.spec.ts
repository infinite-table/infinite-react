import { test, expect } from '@testing';

import {
  eventually,
  expectClose,
  getBody,
  getCell,
  getContentScrollPosition,
  scrollToAndCheck,
  setContentScroll,
} from './largeContentTestUtils';
import { ROW_HEIGHT, VERTICAL_ROW_COUNT } from './largeContentData';

/**
 * Normal layout with 1M rows x 40px = 40M px of content - more than any
 * browser can lay out. The scroll container is capped, its scroll position
 * is mapped onto the content and DOM offsets are written relative to a
 * scroll origin - see source/src/components/VirtualBrain/largeContent.ts
 */

const CONTENT_HEIGHT = VERTICAL_ROW_COUNT * ROW_HEIGHT;

// NOTE: positions used below are mostly above 33.5M px - the most any
// browser supports (Safari, and Chromium's headless shell used by
// Playwright; Chrome itself stops at 16.7M, Firefox at 8.9M) - so the tests
// fail without the large content handling, whatever the browser.

/**
 * At the current scroll position, the first fully visible row must be at
 * the right place, with the right content - and the rows after it too.
 */
async function expectRowsAtScrollPosition(page: any) {
  const body = await getBody(page);
  const { scrollTop } = await getContentScrollPosition(page);

  const firstRow = Math.ceil(scrollTop / ROW_HEIGHT);
  for (const rowIndex of [firstRow, firstRow + 1, firstRow + 5]) {
    const cell = await getCell(page, rowIndex, 'id');
    expect(cell, `row ${rowIndex} should be rendered`).not.toBeNull();
    expect(cell!.text).toBe(`${rowIndex}`);
    expectClose(cell!.top, body.top + rowIndex * ROW_HEIGHT - scrollTop);
  }
}

export default test.describe('Very large content - normal layout', () => {
  test.beforeEach(() => {
    test.setTimeout(30_000);
  });

  test('the scroll container is capped, but the scrollbar reaches the last row', async ({
    page,
  }) => {
    await page.waitForInfinite();

    const body = await getBody(page);
    // the browser can't have a 40M px scroll container
    expect(body.nativeScrollHeight).toBeLessThan(CONTENT_HEIGHT);

    // the API still works with content pixels
    const { scrollTopMax } = await getContentScrollPosition(page);
    expect(scrollTopMax).toBe(CONTENT_HEIGHT - body.height);

    await setContentScroll(page, { scrollTop: scrollTopMax });

    await eventually(async () => {
      const lastRow = await getCell(page, VERTICAL_ROW_COUNT - 1, 'id');
      expect(lastRow).not.toBeNull();
      expect(lastRow!.text).toBe(`${VERTICAL_ROW_COUNT - 1}`);
      // flush with the bottom of the viewport
      expectClose(lastRow!.bottom, body.bottom);
    });
  });

  test('rows far away are rendered at the right place', async ({ page }) => {
    await page.waitForInfinite();

    for (const scrollTop of [20_000_000, 33_333_333, 5_555_555, 39_000_000]) {
      await scrollToAndCheck(page, { scrollTop });
      await eventually(() => expectRowsAtScrollPosition(page));
    }
  });

  test('rows stay at the right place while the scroll origin moves', async ({
    page,
  }) => {
    await page.waitForInfinite();

    // small steps - they cross the origin's rebase distance (1M px) several
    // times, in both directions. Above 33.5M px: beyond what any browser
    // supports, so the test fails without the large content handling, in
    // any browser
    let scrollTop = 35_000_000;
    const steps = [
      ...Array(6).fill(250_000),
      ...Array(9).fill(-250_000),
      ...Array(3).fill(250_000),
    ];
    for (const step of [0, ...steps]) {
      scrollTop += step;
      await scrollToAndCheck(page, { scrollTop });
      await eventually(() => expectRowsAtScrollPosition(page));
    }
  });

  test('wheel scrolling moves the content consistently', async ({ page }) => {
    await page.waitForInfinite();

    await scrollToAndCheck(page, { scrollTop: 36_000_000 });
    await eventually(() => expectRowsAtScrollPosition(page));

    const body = await getBody(page);
    await page.mouse.move(body.left + 100, body.top + 100);

    const before = await getContentScrollPosition(page);
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 300);
      await eventually(async () => {
        const { scrollTop } = await getContentScrollPosition(page);
        expect(scrollTop).toBeGreaterThan(before.scrollTop);
      });
      await eventually(() => expectRowsAtScrollPosition(page));
    }
  });

  test('scrollRowIntoView reaches any row', async ({ page, apiModel }) => {
    await page.waitForInfinite();
    const body = await getBody(page);

    for (const rowIndex of [999_999, 654_321, 123_456, 0]) {
      await apiModel.evaluate((api, rowIndex) => {
        api.scrollRowIntoView(rowIndex);
      }, rowIndex);

      await eventually(async () => {
        const cell = await getCell(page, rowIndex, 'id');
        expect(cell).not.toBeNull();
        expect(cell!.top).toBeGreaterThanOrEqual(body.top - 1);
        expect(cell!.bottom).toBeLessThanOrEqual(body.bottom + 1);
      });
    }
  });

  test('the active cell indicator stays on the active cell', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await scrollToAndCheck(page, { scrollTop: 36_000_000 });
    await eventually(() => expectRowsAtScrollPosition(page));

    const { scrollTop } = await getContentScrollPosition(page);
    const rowIndex = Math.ceil(scrollTop / ROW_HEIGHT) + 3;
    const cell = (await getCell(page, rowIndex, 'name'))!;
    await page.mouse.click(cell.left + 10, cell.top + 10);

    const expectIndicatorOnCell = async () => {
      const cell = await getCell(page, rowIndex, 'name');
      const indicator = await page
        .locator('[data-name="active-cell-indicator"]')
        .boundingBox();
      expect(cell).not.toBeNull();
      expect(indicator).not.toBeNull();
      expectClose(indicator!.y + indicator!.height / 2, cell!.top + 20);
      expectClose(indicator!.x + indicator!.width / 2, cell!.left + 60);
    };
    await eventually(expectIndicatorOnCell);

    // move the scroll origin away and come back
    await scrollToAndCheck(page, { scrollTop: scrollTop + 1_500_000 });
    await eventually(() => expectRowsAtScrollPosition(page));
    await setContentScroll(page, { scrollTop });
    await eventually(expectIndicatorOnCell);
  });

  test('keeps the content position when the row count changes', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await scrollToAndCheck(page, { scrollTop: 36_000_000 });
    await eventually(() => expectRowsAtScrollPosition(page));
    const { scrollTop } = await getContentScrollPosition(page);

    // still too large for the browser, but a different scroll ratio
    await page.evaluate(() => (globalThis as any).setRowCount(950_000));

    await eventually(async () => {
      const current = await getContentScrollPosition(page);
      expect(current.scrollTopMax).toBe(
        950_000 * ROW_HEIGHT - (await getBody(page)).height,
      );
      // the same content stays in view (within a native px x ratio)
      expectClose(current.scrollTop, scrollTop, 3);
      await expectRowsAtScrollPosition(page);
    });

    // small enough for the browser again - no more mapping
    await page.evaluate(() => (globalThis as any).setRowCount(1_000));

    await eventually(async () => {
      const body = await getBody(page);
      expect(body.nativeScrollHeight).toBe(1_000 * ROW_HEIGHT);

      const lastRow = await getCell(page, 999, 'id');
      expect(lastRow).not.toBeNull();
      expectClose(lastRow!.bottom, body.bottom);
      await expectRowsAtScrollPosition(page);
    });
  });
});
