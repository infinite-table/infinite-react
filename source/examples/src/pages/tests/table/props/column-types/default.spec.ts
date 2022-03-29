import {
  getHeaderColumnIds,
  getHeaderCellWidthByColumnId,
  getHeaderCellByColumnId,
} from '../../../testUtils';

import { test, expect } from '@playwright/test';

export default test.describe.parallel('Column types tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/props/column-types/default`);
    await page.waitForSelector('[data-column-id]');
  });

  test('expect column types defaultWidth works correctly', async ({ page }) => {
    let colIds = await getHeaderColumnIds({ page });

    expect(colIds).toEqual(['id', 'country', 'city', 'salary']);

    const idSize = await getHeaderCellWidthByColumnId('id', { page });
    const countrySize = await getHeaderCellWidthByColumnId('country', { page });
    const citySize = await getHeaderCellWidthByColumnId('city', { page });
    const salarySize = await getHeaderCellWidthByColumnId('salary', { page });

    expect(idSize).toEqual(255);
    expect(countrySize).toEqual(400);
    expect(citySize).toEqual(155);
    expect(salarySize).toEqual(255);
  });

  test('expect column types header works correctly', async ({ page }) => {
    let colIds = await getHeaderColumnIds({ page });

    expect(colIds).toEqual(['id', 'country', 'city', 'salary']);

    const idNode = await getHeaderCellByColumnId('id', { page });
    const salaryNode = await getHeaderCellByColumnId('salary', { page });

    const idHeader = await idNode!.evaluate(
      (node) => (node as HTMLElement).innerText,
    );
    const salaryHeader = await salaryNode!.evaluate(
      (node) => (node as HTMLElement).innerText,
    );

    expect(idHeader).toEqual('number col');
    expect(salaryHeader).toEqual('number col');
  });
});
