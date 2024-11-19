import { test, expect } from '@testing';

export default test.describe('TreeApi ', () => {
  test('addData + update the node works one after the other', async ({
    page,
    tableModel,
    apiModel,
  }) => {
    await page.waitForInfiniteHeader();

    await page.click('button:text("Add initial data")');
    await page.click('button:text("add & update")');

    const treeCol = tableModel.withColumn('name');
    let treeData = await treeCol.getValues();

    const values = [
      'Documents - 1',
      'Private - 10',
      'Public - 11',
      'Desktop - 2',
      'unknown.txt - 20',
    ];
    expect(treeData).toEqual(values);

    const data = await apiModel.evaluateDataSource((ds) => {
      const data = ds.getDataByNodePath(['2', '20']);
      return data;
    });

    expect(data).toMatchObject({
      id: '20',
      name: 'unknown.txt',
      type: 'file',
    });
  });

  test('insertData at end of node', async ({ page, tableModel, apiModel }) => {
    await page.waitForInfiniteHeader();

    await page.click('button:text("Add initial data")');
    await page.click('button:text("add at the end of node")');

    const treeCol = tableModel.withColumn('name');
    let treeData = await treeCol.getValues();

    const values = [
      'Documents - 1',
      'Private - 10',
      'Public - 11',
      'Desktop - 2',
      'unknown2.txt - 21',
      'unknown.txt - 20',
    ];
    expect(treeData).toEqual(values);

    const data = await apiModel.evaluateDataSource((ds) => {
      const data = ds.getDataByNodePath(['2', '20']);
      return data;
    });

    expect(data).toMatchObject({
      id: '20',
      name: 'unknown.txt',
      type: 'file',
    });
  });
});
