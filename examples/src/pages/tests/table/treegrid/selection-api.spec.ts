import { test, expect, Page } from '@testing';

async function getCheckboxes(page: Page) {
  let checkboxes = await page.$$('.InfiniteBody input[type="checkbox"]');

  return await Promise.all(
    checkboxes.map(
      async (checkbox) =>
        await checkbox.evaluate((el) =>
          (el as HTMLInputElement).indeterminate
            ? null
            : (el as HTMLInputElement).checked,
        ),
    ),
  );
}

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
