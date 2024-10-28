import { test, expect } from '@testing';

export default test.describe('TreeApi update children', () => {
  test('works as expected', async ({ page, tableModel, apiModel }) => {
    await page.waitForInfinite();

    const treeCol = tableModel.withColumn('name');

    let treeData = await treeCol.getValues();

    expect(treeData).toEqual([
      'Documents - 1',
      'report.doc - 2',
      'pictures - 3',
      'mountain.jpg - 5',
      'last.txt - 7',
      'diverse - 4',
      'beach.jpg - 6',
    ]);

    let picturesRowInfo = await apiModel.evaluateDataSource((api) => {
      return api.getRowInfoByIndex(2);
    });

    expect(picturesRowInfo.deepRowInfoArray.map((x: any) => x.id)).toEqual([
      '5',
      '7',
    ]);

    // click the button with text "update"
    await page.click('button:text("update")');

    treeData = await treeCol.getValues();

    expect(treeData).toEqual([
      'Documents - 1',
      'report.doc - 2',
      'pictures - 3',
      'diverse - 4',
      'x - x',
      'y - y',
      'beach.jpg - 6',
    ]);

    picturesRowInfo = await apiModel.evaluateDataSource((api) => {
      return api.getRowInfoByIndex(2);
    });

    expect(picturesRowInfo.deepRowInfoArray).toEqual(undefined);
  });
});
