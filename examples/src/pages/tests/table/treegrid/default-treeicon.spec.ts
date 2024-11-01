import { test, expect } from '@testing';

export default test.describe('Default tree icon', () => {
  test('should not render for leaf nodes', async ({ page }) => {
    await page.waitForInfinite();

    async function getInfo() {
      const icons = await page.$$('[data-name="expand-collapse-icon"]');

      return Promise.all(
        icons.map(async (icon) => {
          const expanded = await icon.evaluate((el) => {
            return [...el.classList].some((str) => {
              return str.includes('--expanded');
            });
          });

          const text = await icon.evaluate(
            (node) => node.parentNode?.textContent,
          );

          return {
            expanded,
            text,
          };
        }),
      );
    }

    let res = await getInfo();

    expect(res).toEqual([
      {
        text: 'Documents - 1',
        expanded: true,
      },
      {
        text: 'pictures - 3',
        expanded: true,
      },
    ]);
  });
});
