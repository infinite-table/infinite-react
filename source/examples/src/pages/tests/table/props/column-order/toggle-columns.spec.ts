import { test, expect } from '@playwright/test';

import { getHeaderColumnIds } from '../../../testUtils';
import { getRowObject } from '../../../testUtils/getRowObject';

import { rowData } from './rowData';

const expectedFirstRow = {
  id: `${rowData[0].id}`,
  make: `${rowData[0].make}`,
  year: `${rowData[0].year}`,
  price: `${rowData[0].price}`,
};
const initialColumns = ['id', 'make', 'year', 'price'];

export default test.describe.parallel('Column order toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/props/column-order/toggle-columns`);
  });

  test('should display all cols', async ({ page }) => {
    await page.waitForTimeout(50);
    let colIds = await getHeaderColumnIds({ page });

    expect(colIds).toEqual(initialColumns);

    let firstRow = await getRowObject(0, { page });
    expect(firstRow).toEqual(expectedFirstRow);

    await page.click('button');

    await page.waitForTimeout(20);
    colIds = await getHeaderColumnIds({ page });
    expect(colIds).toEqual(['id', 'make']);
    firstRow = await getRowObject(0, { page });
    expect(firstRow).toEqual({
      id: `${rowData[0].id}`,
      make: `${rowData[0].make}`,
    });

    await page.click('button');
    await page.waitForTimeout(20);

    colIds = await getHeaderColumnIds({ page });
    expect(colIds).toEqual(initialColumns);

    firstRow = await getRowObject(0, { page });
    expect(firstRow).toEqual(expectedFirstRow);
  });
});
