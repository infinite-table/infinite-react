import { test, expect } from '@testing';

export default test.describe('RenderBagtree icon', () => {
  test('should work well', async ({ page }) => {
    await page.waitForInfinite();

    async function getInfo() {
      const leafIcons = await page.$$('[data-name="expander-icon"]');

      return Promise.all(
        leafIcons.map(async (icon) => {
          const cls = await icon.getAttribute('class');

          return cls?.includes('collapsed') ? 'collapsed' : 'expanded';
        }),
      );
    }

    let res = await getInfo();

    expect(res).toEqual([
      'expanded',
      'collapsed',
      'expanded',
      'collapsed',
      'collapsed',
    ]);
  });
});
