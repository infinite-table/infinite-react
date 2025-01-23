import { test, expect } from '@testing';

export default test.describe('TreeApi ', () => {
  test('addData + update the node works one after the other', async ({
    page,
    tableModel,
  }) => {
    await page.waitForInfiniteHeader();

    await page.click('button:text("Add initial data")');
    await page.click('button:text("fail")');

    const treeCol = tableModel.withColumn('name');
    let treeData = await treeCol.getValues();

    const values = [
      'Documents - 1',
      'Private - 10',
      'Public - 11',
      // 'Desktop - 2',
      // 'unknown.txt - 20',
    ];
    expect(treeData).toEqual(values);
  });
});
