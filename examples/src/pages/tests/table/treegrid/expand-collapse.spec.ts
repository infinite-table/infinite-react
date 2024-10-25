import { test, expect } from '@testing';

export default test.describe('Controlled collapse and expand', () => {
  test('should work via the api', async ({ page, apiModel, rowModel }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toBe(7);

    await apiModel.evaluateDataSource((api) => {
      api.treeApi.collapseAll();
    });

    expect(await rowModel.getRenderedRowCount()).toBe(1);

    await apiModel.evaluateDataSource((api) => {
      api.treeApi.expandAll();
    });

    expect(await rowModel.getRenderedRowCount()).toBe(7);

    await apiModel.evaluateDataSource((api) => {
      api.treeApi.collapseNode(['1', '3']);
    });

    expect(await rowModel.getRenderedRowCount()).toBe(6);

    await apiModel.evaluateDataSource((api) => {
      api.treeApi.collapseNode(['1']);
    });

    expect(await rowModel.getRenderedRowCount()).toBe(1);

    await apiModel.evaluateDataSource((api) => {
      api.treeApi.expandNode(['1']);
    });

    expect(await rowModel.getRenderedRowCount()).toBe(6);
  });
});
