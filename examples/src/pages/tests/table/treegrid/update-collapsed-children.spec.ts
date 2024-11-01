import { test, expect } from '@testing';

export default test.describe('TreeApi update collapsed children', () => {
  test('works as expected', async ({ page, tableModel, treeModel }) => {
    await page.waitForInfinite();

    const treeCol = tableModel.withColumn('name');

    let treeData = await treeCol.getValues();

    const initialFull = [
      'Documents - 1',
      'report.doc - 10',
      'pictures - 11',
      'vacation.jpg - 110',
      'island.jpg - 111',
      'diverse - 12',
      'beach.jpg - 120',
    ];
    const withPicturesCollapsed = [
      'Documents - 1',
      'report.doc - 10',
      'pictures - 11',
      'diverse - 12',
      'beach.jpg - 120',
    ];

    const fullUpdated = [
      'Documents - 1',
      'report.doc - 10',
      'pictures - 11',
      'my new vacation.jpg - 110',
      'my new island.jpg - 111',
      'diverse - 12',
      'beach.jpg - 120',
    ];

    expect(treeData).toEqual(withPicturesCollapsed);

    await treeModel.toggleParentNode(2);

    treeData = await treeCol.getValues();
    expect(treeData).toEqual(initialFull);

    await treeModel.toggleParentNode(2);

    treeData = await treeCol.getValues();
    expect(treeData).toEqual(withPicturesCollapsed);

    await page.click('button:text("Update by path")');
    await page.click('button:text("Update by id")');

    await treeModel.toggleParentNode(2);

    treeData = await treeCol.getValues();
    expect(treeData).toEqual(fullUpdated);
  });
});
