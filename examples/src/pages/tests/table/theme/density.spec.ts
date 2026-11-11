import { test, expect, Page } from '@testing';

type Sizes = {
  rowHeight: number;
  headerHeight: number;
  cellPadding: string;
  headerCellPadding: string;
  fontSizeRatio: number;
};

async function getSizes(page: Page, gridSelector: string): Promise<Sizes> {
  // wait for the CSS watchers (resize observers) to report the new values
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  return page.evaluate((gridSelector) => {
    const grid = document.querySelector(gridSelector)!;
    const root = grid.querySelector('.Infinite')!;
    const cell = grid.querySelector(
      '.InfiniteColumnCell[data-column-id="firstName"][data-row-index="0"]',
    )!;
    const headerCell = grid.querySelector(
      '.InfiniteHeaderCell[data-column-id="firstName"]',
    )!;
    const headerCellContent = headerCell.firstElementChild!;

    return {
      rowHeight: cell.getBoundingClientRect().height,
      headerHeight: headerCell.getBoundingClientRect().height,
      cellPadding: getComputedStyle(cell).padding,
      headerCellPadding: getComputedStyle(headerCellContent).padding,
      fontSizeRatio:
        parseFloat(getComputedStyle(root).fontSize) /
        parseFloat(getComputedStyle(root.parentElement!).fontSize),
    };
  }, gridSelector);
}

const DEFAULT_GRID = '#default-grid';
const EXPLICIT_GRID = '#explicit-grid';

export default test.describe.parallel('Density', () => {
  test('without a density className, sizes are the theme defaults', async ({
    page,
  }) => {
    await page.waitForInfinite();

    expect(await getSizes(page, DEFAULT_GRID)).toEqual({
      rowHeight: 40,
      headerHeight: 30,
      cellPadding: '4px 8px',
      headerCellPadding: '8px',
      fontSizeRatio: 1,
    });
  });

  test('density className on an ancestor scales the sizes', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await page.click('[data-name="wrapper-compact"]');

    const compact = await getSizes(page, DEFAULT_GRID);
    expect(compact.rowHeight).toBe(32);
    expect(compact.headerHeight).toBe(24);
    expect(compact.cellPadding).toBe('3.2px 6.4px');
    expect(compact.headerCellPadding).toBe('6.4px');
    expect(compact.fontSizeRatio).toBeCloseTo(2.8 / 3, 3);

    await page.click('[data-name="wrapper-spacious"]');

    const spacious = await getSizes(page, DEFAULT_GRID);
    expect(spacious.rowHeight).toBe(48);
    expect(spacious.headerHeight).toBe(36);
    expect(spacious.cellPadding).toBe('4.8px 9.6px');
    expect(spacious.fontSizeRatio).toBeCloseTo(3.2 / 3, 3);
  });

  test('density className on the grid itself scales the sizes and wins over an ancestor', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await page.click('[data-name="grid-spacious"]');
    expect((await getSizes(page, DEFAULT_GRID)).rowHeight).toBe(48);

    // the closest density wins
    await page.click('[data-name="wrapper-compact"]');
    expect((await getSizes(page, DEFAULT_GRID)).rowHeight).toBe(48);

    await page.click('[data-name="grid-comfortable"]');
    expect(await getSizes(page, DEFAULT_GRID)).toEqual({
      rowHeight: 40,
      headerHeight: 30,
      cellPadding: '4px 8px',
      headerCellPadding: '8px',
      fontSizeRatio: 1,
    });

    await page.click('[data-name="reset"]');
    expect((await getSizes(page, DEFAULT_GRID)).rowHeight).toBe(40);
  });

  test('onRowHeightChange is not called for the default row height, only when the density changes it', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await getSizes(page, DEFAULT_GRID);

    const getChanges = () =>
      page.evaluate(() => (globalThis as any).rowHeightChanges);

    expect(await getChanges()).toEqual([]);

    await page.click('[data-name="wrapper-compact"]');
    await getSizes(page, DEFAULT_GRID);
    const changes: number[] = await getChanges();
    // CSS-var driven row heights can notify more than once per change
    // (same as for a CSS var passed as rowHeight), so only check the values
    expect(changes.length).toBeGreaterThan(0);
    expect(changes.every((rowHeight) => rowHeight === 32)).toBe(true);
  });

  test('explicit rowHeight and columnHeaderHeight are not scaled', async ({
    page,
  }) => {
    await page.waitForInfinite();

    expect((await getSizes(page, EXPLICIT_GRID)).rowHeight).toBe(30);

    await page.click('[data-name="wrapper-compact"]');

    const sizes = await getSizes(page, EXPLICIT_GRID);
    expect(sizes.rowHeight).toBe(30);
    expect(sizes.headerHeight).toBe(50);
    // but the paddings are
    expect(sizes.cellPadding).toBe('3.2px 6.4px');
  });

  test('an explicit --infinite-cell-padding is used as is', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await page.addStyleTag({
      content: `#wrapper { --infinite-cell-padding: 10px; --infinite-header-cell-padding: 3px; }`,
    });
    await page.click('[data-name="wrapper-compact"]');

    const sizes = await getSizes(page, DEFAULT_GRID);
    expect(sizes.cellPadding).toBe('10px');
    expect(sizes.headerCellPadding).toBe('3px');
    expect(sizes.rowHeight).toBe(32);
  });

  test('the theme row height is used when rowHeight is not specified', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await page.addStyleTag({
      content: `#wrapper { --infinite-row-height: 50px; --infinite-column-header-height: 44px; }`,
    });

    let sizes = await getSizes(page, DEFAULT_GRID);
    expect(sizes.rowHeight).toBe(50);
    expect(sizes.headerHeight).toBe(44);

    await page.click('[data-name="wrapper-compact"]');

    sizes = await getSizes(page, DEFAULT_GRID);
    // rounded
    expect(sizes.rowHeight).toBe(40);
    expect(sizes.headerHeight).toBe(35);

    // the explicit grid is not affected
    expect((await getSizes(page, EXPLICIT_GRID)).rowHeight).toBe(30);
  });

  test('--infinite-font-size sets the font size, scaled by the density', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await page.addStyleTag({
      content: `#wrapper { --infinite-font-size: 12px; }`,
    });

    const getFontSize = () =>
      page.evaluate(() =>
        parseFloat(
          getComputedStyle(document.querySelector('#default-grid .Infinite')!)
            .fontSize,
        ),
      );

    expect(await getFontSize()).toBe(12);

    await page.click('[data-name="wrapper-compact"]');
    expect(await getFontSize()).toBeCloseTo((12 * 2.8) / 3, 2);
  });
});
