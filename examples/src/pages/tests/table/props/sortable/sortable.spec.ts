import { test, expect } from '@testing';

export default test.describe.parallel('Table', () => {
  test('columnDefaultSortable=false - sorting column does not work, as cols are not sortable', async ({
    page,
    tableModel,
  }) => {
    await page.waitForInfinite();

    const firstNameCol = tableModel.withColumn('firstName');

    expect(await firstNameCol.getValues()).toEqual(['Bob', 'Alice', 'Bill']);

    await firstNameCol.clickToSort();

    expect(await firstNameCol.getValues()).toEqual(['Bob', 'Alice', 'Bill']);
  });

  test('columnDefaultSortable=false - sorting column with defaultSortable=true should work', async ({
    page,

    tableModel,
  }) => {
    await page.waitForInfinite();

    const col = tableModel.withColumn('id');

    let values = await col.getValues();

    expect(values).toEqual(['20', '3', '10']);

    // click the column header

    col.clickToSort();

    await page.waitForTimeout(20);

    // refetch values
    values = await col.getValues();

    expect(values).toEqual(['3', '10', '20']);
  });
});
