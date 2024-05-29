import { test, expect } from '@testing';

export default test.describe('Keyboard shortcuts', () => {
  test('should support cmd|ctrl alias', async ({ page }) => {
    await page.load();
    const getCombinations = async () => {
      return await page.evaluate(() => (globalThis as any).combinations);
    };
    const options = {
      delay: 20,
    };

    await page.keyboard.press('Alt+g', options);
    await page.keyboard.press('Meta+g', options);
    await page.keyboard.press('Control+g', options);
    await page.keyboard.press('Control+g', options);

    expect(await getCombinations()).toEqual({
      'cmd+g': 1,
      'ctrl+g': 2,
    });

    await page.keyboard.press('Control+Shift+Enter', options);
    await page.keyboard.press('Meta+Shift+i', options);

    expect(await getCombinations()).toEqual({
      'cmd+g': 1,
      'ctrl+g': 2,
      'ctrl+shift+enter': 1,
      'cmd+shift+i': 1,
    });
  });
});
