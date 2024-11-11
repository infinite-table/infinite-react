import { test, expect } from '@testing';

export default test.describe('TreeApi updateChildrenByNodePath', () => {
  test('works as expected', async ({ page, tableModel, treeModel }) => {
    await page.waitForInfinite();

    const treeCol = tableModel.withColumn('name');

    await page.click('button:text("update")');

    await treeModel.toggleParentNode(2);

    let treeData = await treeCol.getValues();

    expect(treeData).toEqual([
      'Documents - 1',
      'report.doc - 2',
      'pictures - 3',
      'mountain.jpg - 5',
      'new.txt - 8',
      'last.txt - 7',
    ]);

    await page.click('button:text("remove")');

    treeData = await treeCol.getValues();

    expect(treeData).toEqual([
      'Documents - 1',
      'report.doc - 2',
      'pictures - 3',

      'last.txt - 7',
    ]);
  });
});
