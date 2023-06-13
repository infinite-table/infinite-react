import { test, expect } from '@testing';

export default test.describe.parallel('Multi sorting', () => {
  test('uncontrolled sortInfo should work fine', async ({
    page,
    tableModel,
  }) => {
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
    expect(await companyNameCol.getHeader()).toEqual('CompanyName\n1');

    await itemCountCol.clickToSort();
    expect(await itemCountCol.getHeader()).toEqual('ItemCount\n1');
    expect(await companyNameCol.getHeader()).toEqual('CompanyName');

    await companyNameCol.clickToSort({ ctrlKey: true });
    expect(await itemCountCol.getHeader()).toEqual('ItemCount\n1');
    expect(await companyNameCol.getHeader()).toEqual('CompanyName\n2');

    await companyNameCol.clickToSort();
    expect(await itemCountCol.getHeader()).toEqual('ItemCount');
    expect(await companyNameCol.getHeader()).toEqual('CompanyName\n1');
  });
});
