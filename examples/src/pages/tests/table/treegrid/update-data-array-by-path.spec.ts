import { test, expect } from '@testing';

export default test.describe('TreeApi update data array by path', () => {
  test('works as expected', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const treeCol = tableModel.withColumn('name');

    await page.click('button:text("update")');

    let treeData = await treeCol.getValues();

    expect(treeData).toEqual([
      'Documents - 1',
      'report.doc - 2',
      'pictures - 3',
      'diverse - 4',
      'x - x',
      'y - y',
    ]);
  });
});
