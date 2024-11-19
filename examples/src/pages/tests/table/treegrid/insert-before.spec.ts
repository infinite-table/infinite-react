import { test, expect } from '@testing';

export default test.describe('TreeApi insertData before', () => {
  test('works with nodePath as reference', async ({
    page,
    tableModel,
    apiModel,
  }) => {
    await page.waitForInfiniteHeader();

    await page.click('button:text("Add initial data")');
    await page.click('button:text("Insert before 1/11")');

    const treeCol = tableModel.withColumn('name');
    let treeData = await treeCol.getValues();

    const values = [
      'Documents - 1',
      'Private - 10',
      'New Child - 8',
      'Public - 11',
      'Protected - 12',
      'Desktop - 2',
      'unknown.txt - 20',
      'test.txt - 201',
    ];
    expect(treeData).toEqual(values);

    let data = await apiModel.evaluateDataSource((ds) => {
      const data = ds.getDataByNodePath(['1', '8']);
      return data;
    });

    expect(data).toMatchObject({ name: 'New Child', type: 'file', id: '8' });

    await page.click('button:text("Insert at start")');

    treeData = await treeCol.getValues();
    expect(treeData).toEqual(['Start - 000', ...values]);
  });
});
