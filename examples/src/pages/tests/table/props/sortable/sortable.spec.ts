import { test, expect } from '@testing';

export default test.describe.parallel('Table', () => {
  test('sortable=false - sorting column does not work, as table is sortable=false', async ({
    page,
    headerModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const col = { colId: 'firstName' };

    let values = await rowModel.getTextForColumnCells(col);

    expect(values).toEqual(['Bob', 'Alice', 'Bill']);

    // click the column header
    await headerModel.clickColumnHeader(col);

    await page.waitForTimeout(10);

    // refetch values
    values = await rowModel.getTextForColumnCells(col);

    expect(values).toEqual(['Bob', 'Alice', 'Bill']);
  });

  test('sortable=false - sorting column with sortable=true should work', async ({
    page,
    headerModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const col = { colId: 'id' };

    let values = await rowModel.getTextForColumnCells(col);

    expect(values).toEqual(['20', '3', '10']);

    // click the column header
    await headerModel.clickColumnHeader(col);

    await page.waitForTimeout(20);

    // refetch values
    values = await rowModel.getTextForColumnCells(col);

    expect(values).toEqual(['3', '10', '20']);
  });
});
