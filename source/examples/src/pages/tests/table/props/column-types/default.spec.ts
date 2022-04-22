import { test, expect } from '@testing';

import {
  getHeaderColumnIds,
  getHeaderCellWidthByColumnId,
  getHeaderCellByColumnId,
} from '../../../testUtils';

export default test.describe.parallel('Column types tests', () => {
  test('expect column types defaultWidth works correctly', async ({ page }) => {
    const colIds = await getHeaderColumnIds({ page });

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
    const colIds = await getHeaderColumnIds({ page });

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
