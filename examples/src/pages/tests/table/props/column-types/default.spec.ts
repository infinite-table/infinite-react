import { test, expect } from '@testing';

import { getHeaderColumnIds } from '../../../testUtils';

export default test.describe.parallel('Column types tests', () => {
  test('expect column types defaultWidth works correctly', async ({
    page,
    columnModel,
  }) => {
    await page.waitForInfinite();
    const colIds = await getHeaderColumnIds({ page });

    expect(colIds).toEqual(['id', 'country', 'city', 'salary']);

    const {
      id: idSize,
      country: countrySize,
      city: citySize,
      salary: salarySize,
    } = (await columnModel.getColumnWidths(['id', 'country', 'city', 'salary']))
      .map;

    expect(idSize).toEqual(255);
    expect(countrySize).toEqual(400);
    expect(citySize).toEqual(155);
    expect(salarySize).toEqual(255);
  });

  test('expect column types header works correctly', async ({
    page,
    headerModel,
    columnModel,
  }) => {
    await page.waitForInfinite();
    const colIds = await columnModel.getVisibleColumnIds();

    expect(colIds).toEqual(['id', 'country', 'city', 'salary']);

    const idNode = headerModel.getHeaderCellLocator({ colId: 'id' });
    const salaryNode = headerModel.getHeaderCellLocator({ colId: 'salary' });

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
