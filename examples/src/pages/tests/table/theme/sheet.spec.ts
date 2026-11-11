import { test, expect } from '@testing';

import { getThemeDemoInfo, setDensity } from './themeTestUtils';

export default test.describe.parallel('Sheet theme', () => {
  test('has full gridlines, sharp corners and a row number gutter', async ({
    page,
  }) => {
    await page.waitForInfinite();

    const info = await getThemeDemoInfo(page);
    expect(info.fontSize).toBe(13);
    expect(info.rowHeight).toBe(26);
    expect(info.headerHeight).toBe(26);
    expect(info.cellBorderRadius).toBe('0px');

    const styles = await page.evaluate(() => {
      const root = document.querySelector('#theme-demo .Infinite')!;
      const cell = root.querySelector(
        '.InfiniteColumnCell[data-column-id="price"][data-row-index="2"]',
      )!;
      const gutter = root.querySelector(
        '.InfiniteColumnCell[data-column-id="rowNumber"][data-row-index="2"]',
      )!;
      const header = root.querySelector('.InfiniteHeaderCell')!;
      const indicator = root.querySelector('.Infinite-ActiveCellIndicator')!;
      return {
        cellBorderRight: getComputedStyle(cell).borderRightStyle,
        cellBorderTop: getComputedStyle(cell).borderTopStyle,
        gutterBackground: getComputedStyle(gutter).backgroundColor,
        headerBackground: getComputedStyle(header).backgroundColor,
        indicatorBorderWidth: getComputedStyle(indicator).borderTopWidth,
        fillHandle: getComputedStyle(indicator, '::after').content,
      };
    });
    expect(styles.cellBorderRight).toBe('solid');
    expect(styles.cellBorderTop).toBe('solid');
    // the first pinned column looks like the header
    expect(styles.gutterBackground).toBe(styles.headerBackground);
    // the active cell has a thick border and a fill handle
    expect(styles.indicatorBorderWidth).toBe('2px');
    expect(styles.fillHandle).toBe('""');
  });

  test('works with the density classNames', async ({ page }) => {
    await page.waitForInfinite();

    await setDensity(page, 'compact');
    let info = await getThemeDemoInfo(page);
    expect(info.rowHeight).toBe(21);
    expect(info.headerHeight).toBe(21);

    await setDensity(page, 'spacious');
    info = await getThemeDemoInfo(page);
    expect(info.rowHeight).toBe(31);
  });

  test('has a light and a dark mode', async ({ page }) => {
    await page.waitForInfinite();

    expect((await getThemeDemoInfo(page)).background).toBe(
      'rgb(255, 255, 255)',
    );
    await page.click('[data-name="mode"]');
    expect((await getThemeDemoInfo(page)).background).toBe('rgb(27, 29, 28)');
  });
});
