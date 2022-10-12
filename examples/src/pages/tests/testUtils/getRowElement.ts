import { Page } from '@playwright/test';

/**
 * @deprecated
 */
export const getRowElement = async (
  rowIndex: number,
  { page }: { page: Page },
) => {
  const row = await page.$(getRowSelector(rowIndex));

  return row;
};

/**
 * @deprecated
 */
export const getRowSelector = (rowIndex: number) => {
  return `.InfiniteColumnCell[data-row-index="${rowIndex}"]`;
};

/**
 * @deprecated
 */
export const getRows = ({ page }: { page: Page }) => {
  return page.locator(`[data-row-index]`);
};

/**
 * @deprecated
 */
export const getRow = (
  { rowIndex }: { rowIndex: number },
  { page }: { page: Page },
) => {
  return page.locator(getRowSelector(rowIndex));
};
