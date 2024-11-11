import { test, expect } from '@testing';

export default test.describe('TreeApi updateChildrenByNodePath', () => {
  test('can set children for leaf node, when the leaf node was added dynamically', async ({
    page,
    tableModel,
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
  });
});
