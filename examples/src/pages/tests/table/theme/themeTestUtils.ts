import { Page } from '@playwright/test';

export async function getThemeDemoInfo(page: Page) {
  // let the CSS watchers (resize observers) report the new values
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  return page.evaluate(() => {
    const root = document.querySelector('#theme-demo .Infinite')!;
    const cell = root.querySelector(
      '.InfiniteColumnCell[data-column-id="price"]:not(.InfiniteColumnCell--group-row)',
    )!;
    const headerCell = root.querySelector(
      '.InfiniteHeaderCell[data-column-id="price"]',
    )!;
    const rootStyle = getComputedStyle(root);
    const cellStyle = getComputedStyle(cell);
    const headerStyle = getComputedStyle(headerCell);
    return {
      fontFamily: rootStyle.fontFamily,
      fontSize: parseFloat(rootStyle.fontSize),
      background: rootStyle.backgroundColor,
      rowHeight: cell.getBoundingClientRect().height,
      headerHeight: headerCell.getBoundingClientRect().height,
      cellFontVariantNumeric: cellStyle.fontVariantNumeric,
      cellBorderRadius: cellStyle.borderTopLeftRadius,
      headerTextTransform: headerStyle.textTransform,
    };
  });
}

export async function setDensity(page: Page, density: string) {
  await page.selectOption('[data-name="density"]', density);
}
