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
import {
  COLUMN_WIDTH,
  HORIZONTAL_LAYOUT_ROW_COUNT,
  ROW_HEIGHT,
} from './largeContentData';

/**
 * Horizontal layout (wrapRowsHorizontally) with 1M rows: the rows that don't
 * fit the viewport wrap into more column sets ("pages") to the right, so the
 * row count turns into width - way more than browsers can lay out. Same
 * mapping + scroll origin as the normal layout, on the horizontal axis - see
 * source/src/components/VirtualBrain/largeContent.ts
 */

const COLUMN_COUNT = 5;
const PAGE_WIDTH = COLUMN_COUNT * COLUMN_WIDTH;

async function getRowsPerPage(page: any) {
  const body = await getBody(page);
  return Math.floor(body.height / ROW_HEIGHT);
}

/**
 * At the current scroll position, the first page whose left edge is visible
 * must be at the right place, with the right rows - and the column after it,
 * and the next page too.
 */
async function expectPagesAtScrollPosition(
  page: any,
  rowCount = HORIZONTAL_LAYOUT_ROW_COUNT,
) {
  const body = await getBody(page);
  const rowsPerPage = await getRowsPerPage(page);
  const { scrollLeft } = await getContentScrollPosition(page);

  const pageIndex = Math.ceil(scrollLeft / PAGE_WIDTH);
  const pageLeft = body.left + pageIndex * PAGE_WIDTH - scrollLeft;

  const checks: [number, string, number, number][] = [
    // [rowIndex, columnId, expected left, expected top]
    [pageIndex * rowsPerPage, 'id', pageLeft, body.top],
    [pageIndex * rowsPerPage, 'name', pageLeft + COLUMN_WIDTH, body.top],
    [pageIndex * rowsPerPage + 3, 'id', pageLeft, body.top + 3 * ROW_HEIGHT],
    [(pageIndex + 1) * rowsPerPage, 'id', pageLeft + PAGE_WIDTH, body.top],
  ];
  for (const [rowIndex, columnId, left, top] of checks) {
    if (rowIndex >= rowCount || left > body.right) {
      continue;
    }
    const cell = await getCell(page, rowIndex, columnId);
    expect(
      cell,
      `row ${rowIndex}, ${columnId} should be rendered`,
    ).not.toBeNull();
    if (columnId === 'id') {
      expect(cell!.text).toBe(`${rowIndex}`);
    }
    expectClose(cell!.left, left);
    expectClose(cell!.top, top);
  }
}

export default test.describe('Very large content - horizontal layout', () => {
  test.beforeEach(() => {
    test.setTimeout(30_000);
  });

  test('the scroll container is capped, but the scrollbar reaches the last row', async ({
    page,
  }) => {
    await page.waitForInfinite();

    const body = await getBody(page);
    const rowsPerPage = await getRowsPerPage(page);
    const pageCount = Math.ceil(HORIZONTAL_LAYOUT_ROW_COUNT / rowsPerPage);
    const contentWidth = pageCount * PAGE_WIDTH;

    expect(body.nativeScrollWidth).toBeLessThan(contentWidth);

    const { scrollLeftMax } = await getContentScrollPosition(page);
    expect(scrollLeftMax).toBe(contentWidth - body.width);

    await setContentScroll(page, { scrollLeft: scrollLeftMax });

    await eventually(async () => {
      const lastRowIndex = HORIZONTAL_LAYOUT_ROW_COUNT - 1;
      const lastRow = await getCell(page, lastRowIndex, 'id');
      expect(lastRow).not.toBeNull();
      expect(lastRow!.text).toBe(`${lastRowIndex}`);
      expect(lastRow!.left).toBeGreaterThanOrEqual(body.left);
      expect(lastRow!.right).toBeLessThanOrEqual(body.right + 1);
      // the last page ends at the right edge of the viewport
      expectClose(
        lastRow!.left + PAGE_WIDTH,
        body.right + (pageCount * PAGE_WIDTH - contentWidth),
      );
    });
  });

  test('pages far away are rendered at the right place', async ({ page }) => {
    await page.waitForInfinite();

    for (const scrollLeft of [30_000_000, 12_345_678, 41_000_000, 600_000]) {
      await scrollToAndCheck(page, { scrollLeft });
      await eventually(() => expectPagesAtScrollPosition(page));
    }
  });

  test('pages stay at the right place while the scroll origin moves', async ({
    page,
  }) => {
    await page.waitForInfinite();

    let scrollLeft = 20_000_000;
    const steps = [
      ...Array(5).fill(300_000),
      ...Array(8).fill(-300_000),
      ...Array(3).fill(300_000),
    ];
    for (const step of [0, ...steps]) {
      scrollLeft += step;
      await scrollToAndCheck(page, { scrollLeft });
      await eventually(() => expectPagesAtScrollPosition(page));
    }
  });

  test('the header stays aligned with the body', async ({ page }) => {
    await page.waitForInfinite();

    for (const scrollLeft of [25_000_050, 7_777_777]) {
      await scrollToAndCheck(page, { scrollLeft });
      await eventually(() => expectPagesAtScrollPosition(page));

      const rowsPerPage = await getRowsPerPage(page);
      const pageIndex = Math.ceil(
        (await getContentScrollPosition(page)).scrollLeft / PAGE_WIDTH,
      );
      const bodyCell = (await getCell(page, pageIndex * rowsPerPage, 'name'))!;

      await eventually(async () => {
        const headerLefts = await page.evaluate(() =>
          Array.from(
            document.querySelectorAll(
              '.InfiniteHeaderCell[data-column-id="name"]',
            ),
          ).map((h) => h.getBoundingClientRect().left),
        );
        expect(
          headerLefts.some((left) => Math.abs(left - bodyCell.left) <= 1.5),
          `a "name" header cell should be at ${bodyCell.left}, found ${headerLefts}`,
        ).toBe(true);
      });
    }
  });

  test('scrollRowIntoView reaches any row', async ({ page, apiModel }) => {
    await page.waitForInfinite();
    const body = await getBody(page);

    for (const rowIndex of [999_999, 500_005, 77_777, 3]) {
      await apiModel.evaluate((api, rowIndex) => {
        api.scrollRowIntoView(rowIndex);
      }, rowIndex);

      await eventually(async () => {
        // in horizontal layout, scrollRowIntoView brings the middle column
        // of the row into view (same as when the content fits)
        const cell = await getCell(page, rowIndex, 'code');
        expect(cell, `row ${rowIndex} should be rendered`).not.toBeNull();
        expect(cell!.text).toBe(`c${rowIndex % 997}`);
        expect(cell!.left).toBeGreaterThanOrEqual(body.left - 1);
        expect(cell!.right).toBeLessThanOrEqual(body.right + 1);
      });
    }
  });

  test('the active cell indicator stays on the active cell', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await scrollToAndCheck(page, { scrollLeft: 30_000_100 });
    await eventually(() => expectPagesAtScrollPosition(page));

    const rowsPerPage = await getRowsPerPage(page);
    const { scrollLeft } = await getContentScrollPosition(page);
    const rowIndex = Math.ceil(scrollLeft / PAGE_WIDTH) * rowsPerPage + 2;
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
    await scrollToAndCheck(page, { scrollLeft: scrollLeft + 2_000_000 });
    await eventually(() => expectPagesAtScrollPosition(page));
    await setContentScroll(page, { scrollLeft });
    await eventually(expectIndicatorOnCell);
  });

  test('keeps the content position when the row count changes', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await scrollToAndCheck(page, { scrollLeft: 15_000_000 });
    await eventually(() => expectPagesAtScrollPosition(page));
    const { scrollLeft } = await getContentScrollPosition(page);

    await page.evaluate(() => (globalThis as any).setRowCount(600_000));

    await eventually(async () => {
      const current = await getContentScrollPosition(page);
      expectClose(current.scrollLeft, scrollLeft, 5);
      await expectPagesAtScrollPosition(page);
    });

    // small enough for the browser again - no more mapping
    await page.evaluate(() => (globalThis as any).setRowCount(5_000));

    await eventually(async () => {
      const body = await getBody(page);
      const rowsPerPage = await getRowsPerPage(page);
      expect(body.nativeScrollWidth).toBe(
        Math.ceil(5_000 / rowsPerPage) * PAGE_WIDTH,
      );
      await expectPagesAtScrollPosition(page, 5_000);
    });
  });
});
