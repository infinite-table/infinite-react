import { test, expect } from '@testing';

export default test.describe.parallel('Multi sort behavior', () => {
  test('should be updateable at runtime', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const { getColumnHeaders } = tableModel.withHeader();

    expect(await getColumnHeaders()).toEqual([
      'OrderId',
      'CompanyName',
      'ItemCount',
      'OrderCost',
    ]);

    const companyNameCol = tableModel.withColumn('companyName');
    const itemCountCol = tableModel.withColumn('itemCount');

    await companyNameCol.clickToSort();
    await itemCountCol.clickToSort();

    expect(await getColumnHeaders()).toEqual([
      'OrderId',
      'CompanyName',
      'ItemCount\n1',
      'OrderCost',
    ]);

    await companyNameCol.clickToSort({
      ctrlKey: true,
    });

    expect(await getColumnHeaders()).toEqual([
      'OrderId',
      'CompanyName\n2',
      'ItemCount\n1',
      'OrderCost',
    ]);

    await itemCountCol.clickToSort();

    expect(await getColumnHeaders()).toEqual([
      'OrderId',
      'CompanyName',
      'ItemCount\n1',
      'OrderCost',
    ]);

    const sel = await page.locator('select');

    await sel.selectOption('append');

    await companyNameCol.clickToSort();

    expect(await getColumnHeaders()).toEqual([
      'OrderId',
      'CompanyName\n2',
      'ItemCount\n1',
      'OrderCost',
    ]);
  });
});
