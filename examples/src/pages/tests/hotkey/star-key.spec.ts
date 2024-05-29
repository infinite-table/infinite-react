import { test, expect } from '@testing';

export default test.describe('Keyboard shortcuts', () => {
  test('should allow * with modifiers', async ({ page }) => {
    await page.load();
    const getCombinations = async () => {
      return await page.evaluate(() => (globalThis as any).combinations);
    };
    const options = {
      delay: 20,
    };

    await page.keyboard.press('Shift+i', options);
    await page.keyboard.press('j', options);
    await page.keyboard.press('Alt+x', options);
    await page.keyboard.press('Control+x', options);

    expect(await getCombinations()).toEqual({
      'alt+x': 1,
      'shift+i': 1,
      j: 1,
    });
  });
});
