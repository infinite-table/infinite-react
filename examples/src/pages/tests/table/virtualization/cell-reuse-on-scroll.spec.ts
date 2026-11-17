import { test, expect } from '@testing';

const CELL = '.InfiniteColumnCell:not(.InfiniteDetachedCell)';

/**
 * Marks the DOM elements of all the cells that are rendered now - with a
 * property, which only an element that stays in the document keeps.
 */
async function markRenderedCells(page: any) {
  return page.evaluate((selector: string) => {
    const cells = Array.from(document.querySelectorAll(selector));
    cells.forEach((cell) => {
      (cell as any).__markedBeforeScroll = true;
    });
    return cells.length;
  }, CELL);
}

async function getRenderedCells(page: any) {
  return page.evaluate((selector: string) => {
    const cells = Array.from(document.querySelectorAll<HTMLElement>(selector));
    return {
      count: cells.length,
      marked: cells.filter((cell) => (cell as any).__markedBeforeScroll)
        .length,
      rowIndexes: Array.from(
        new Set(cells.map((cell) => Number(cell.dataset.rowIndex))),
      ).sort((a, b) => a - b),
    };
  }, CELL);
}

async function scrollTo(page: any, scrollTop: number) {
  await page.evaluate((scrollTop: number) => {
    (
      document.querySelector('.InfiniteVirtualScrollContainer') as HTMLElement
    ).scrollTop = scrollTop;
  }, scrollTop);
}

export default test.describe('Virtualization - cells while scrolling', () => {
  test('the DOM elements of the cells are reused for the rows that scroll into view', async ({
    page,
  }) => {
    await page.waitForInfinite();

    const initialCount = await markRenderedCells(page);
    expect(initialCount).toBeGreaterThan(0);

    // far enough for none of the rows that were rendered to still be
    const firstRow = 5_000;
    await scrollTo(page, firstRow * 40);

    await expect
      .poll(async () => (await getRenderedCells(page)).rowIndexes[0])
      .toBeGreaterThanOrEqual(firstRow - 5);

    await expect
      .poll(async () => {
        const cell = page.locator(
          `${CELL}[data-row-index="${firstRow}"][data-column-id="name"]`,
        );
        return (await cell.count()) ? await cell.innerText() : null;
      })
      .toBe(`row ${firstRow}`);

    // all the cells that show the new rows are the elements that were there
    // before the scroll: updated in place, not created again
    const afterScroll = await getRenderedCells(page);
    expect(afterScroll.count).toBe(initialCount);
    expect(afterScroll.marked).toBe(initialCount);

    // and a second scroll, with smaller steps (rows partly staying in view)
    for (const step of [3, 7, 20]) {
      await scrollTo(page, (firstRow + step) * 40);
      await expect
        .poll(async () => {
          const cell = page.locator(
            `${CELL}[data-row-index="${firstRow + step}"][data-column-id="name"]`,
          );
          return (await cell.count()) ? await cell.innerText() : null;
        })
        .toBe(`row ${firstRow + step}`);
    }

    const afterSteps = await getRenderedCells(page);
    expect(afterSteps.count).toBe(initialCount);
    expect(afterSteps.marked).toBe(initialCount);
  });
});
