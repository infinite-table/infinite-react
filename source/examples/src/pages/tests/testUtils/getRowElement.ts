import { Page } from '@playwright/test';

export const getRowElement = async (
  rowIndex: number,
  { page }: { page: Page },
) => {
  const row = await page.$(getRowSelector(rowIndex));

  return row;
};

export const getRowSelector = (rowIndex: number) => {
  return `[data-row-index="${rowIndex}"]`;
};

export const getRows = ({ page }: { page: Page }) => {
  return page.locator(`[data-row-index]`);
};

export const getRow = (
  { rowIndex }: { rowIndex: number },
  { page }: { page: Page },
) => {
  return page.locator(getRowSelector(rowIndex));
};
