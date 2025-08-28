import { test, expect } from '@testing';

export default test.describe('TreeApi', () => {
  test('getSelectedLeafNodePaths works', async ({ page, apiModel }) => {
    await page.waitForInfinite();

    const paths = await apiModel.evaluateTreeApi((treeApi) => {
      return treeApi.getSelectedLeafNodePaths();
    });

    expect(paths).toEqual([
      ['1', '2'],
      ['1', '3', '6'],
      ['1', '4', '7'],
      ['1', '8'],
    ]);
  });
});
