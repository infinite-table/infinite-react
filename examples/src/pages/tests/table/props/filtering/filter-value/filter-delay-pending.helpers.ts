import { Page } from '@testing';

import { HeaderTestingModel } from '../../../../testUtils/HeaderTestingModel';
import { RowTestingModel } from '../../../../testUtils/RowTestingModel';

// the page's filterDelay
export const FILTER_DELAY = 400;

export const ALL = ['John', 'Jane', 'Jack', 'Jill', 'Seb'];

export async function waitPastFilterDelay(page: Page) {
  await page.waitForTimeout(FILTER_DELAY + 400);
}

export async function readFilterState(
  page: Page,
  rowModel: RowTestingModel,
  headerModel: HeaderTestingModel,
) {
  const input = (colId: string) =>
    headerModel.getHeaderCellLocator({ colId }).locator('input');
  return {
    rows: await rowModel.getTextForColumnCells({ colId: 'firstName' }),
    firstNameInput: await input('firstName').inputValue(),
    stackInput: await input('stack').inputValue(),
    changes: await page.evaluate(
      () => (globalThis as any).filterValueChanges ?? [],
    ),
  };
}

export async function applyFirstNameFilter(
  page: Page,
  headerModel: HeaderTestingModel,
  value: string,
) {
  await headerModel.filterColumn({ colId: 'firstName' }, value);
  await waitPastFilterDelay(page);
}
