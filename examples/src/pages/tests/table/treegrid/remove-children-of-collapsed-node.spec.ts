import { test, expect } from '@testing';

export default test.describe.parallel('TreeDataSourceApi', () => {
  test('removeDataArray - with ids of collapsed children', async ({
    page,
    rowModel,
    treeModel,
  }) => {
    await page.waitForInfinite();

    let rowCount = await rowModel.getRenderedRowCount();

    expect(rowCount).toBe(5);

    await treeModel.toggleParentNode(0);

    rowCount = await rowModel.getRenderedRowCount();

    expect(rowCount).toBe(1);

    await page.click('button:text("Click to remove children")');
    await treeModel.toggleParentNode(0);

    rowCount = await rowModel.getRenderedRowCount();

    expect(rowCount).toBe(2);
  });
});
