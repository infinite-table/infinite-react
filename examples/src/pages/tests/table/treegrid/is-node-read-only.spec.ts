import { test, expect } from '@testing';

export default test.describe('isNodeReadOnly', () => {
  test('should work ', async ({ page, rowModel, treeModel, apiModel }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toBe(1);

    await treeModel.toggleParentNode(0);

    expect(await rowModel.getRenderedRowCount()).toBe(1);

    await apiModel.evaluateDataSource((api) => {
      api.treeApi.toggleNode(['1']);
    });

    expect(await rowModel.getRenderedRowCount()).toBe(1);

    // force: true should be respected
    await apiModel.evaluateDataSource((api) => {
      api.treeApi.toggleNode(['1'], { force: true });
    });

    expect(await rowModel.getRenderedRowCount()).toBe(5);
  });
});
