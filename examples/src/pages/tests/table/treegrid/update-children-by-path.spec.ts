import { test, expect } from '@testing';

export default test.describe('TreeApi updateChildrenByNodePath', () => {
  test('can set children for leaf node, when the leaf node was added dynamically', async ({
    page,
    tableModel,
    apiModel,
  }) => {
    await page.waitForInfiniteHeader();

    await page.click('button:text("Add initial data")');
    await page.click('button:text("Add more data")');

    const treeCol = tableModel.withColumn('name');
    let treeData = await treeCol.getValues();

    expect(treeData).toEqual([
      'Documents - 1',
      'Private - 10',
      'New Child - 8',
      'Public - 11',
      'Protected - 12',
      'Desktop - 2',
      'unknown.txt - 20',
      'test.txt - 201',
    ]);

    let data = await apiModel.evaluateDataSource((ds) => {
      const data = ds.getDataByNodePath(['1', '10', '8']);
      return data;
    });

    expect(data).toMatchObject({ name: 'New Child', type: 'file', id: '8' });

    await page.click('button:text("click last")');

    data = await apiModel.evaluateDataSource((ds) => {
      const data = ds.getDataByNodePath(['1', '777', '7777']);
      return data;
    });

    expect(data).toMatchObject({
      id: '7777',
      name: 'child of inserted',
      type: 'file',
    });

    treeData = await treeCol.getValues();

    expect(treeData).toEqual([
      'Documents - 1',
      'Private - 10',
      'New Child - 8',
      'Public - 11',
      'Protected - 12',
      'inserted - 777',
      'child of inserted - 7777',
      'Desktop - 2',
      'unknown.txt - 20',
      'test.txt - 201',
    ]);
  });
});
