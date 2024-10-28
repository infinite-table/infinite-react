import { test, expect } from '@testing';

export default test.describe('Custom tree icon', () => {
  test('should work for leaf nodes as well', async ({ page, apiModel }) => {
    await page.waitForInfinite();

    async function getInfo() {
      const leafIcons = await page.$$('.custom-tree-icon');

      return Promise.all(
        leafIcons.map(async (icon) => {
          const type = await icon.getAttribute('data-type');
          const path = await icon.getAttribute('data-path');

          return {
            type,
            path,
          };
        }),
      );
    }

    let res = await getInfo();

    expect(res).toEqual([
      { type: 'parent', path: '1' },
      { type: 'leaf', path: '1/2' },
      { type: 'parent', path: '1/3' },
      { type: 'leaf', path: '1/3/5' },
      { type: 'leaf', path: '1/7' },
    ]);

    await apiModel.evaluateDataSource((api) => {
      api.treeApi.collapseNode(['1', '3']);
    });

    res = await getInfo();

    expect(res).toEqual([
      { type: 'parent', path: '1' },
      { type: 'leaf', path: '1/2' },
      { type: 'parent', path: '1/3' },
      { type: 'leaf', path: '1/7' },
    ]);
  });
});
