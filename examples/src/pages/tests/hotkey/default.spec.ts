import { test, expect } from '@testing';

export default test.describe('Keyboard shortcuts', () => {
  test('should work', async ({ page }) => {
    await page.load();
    const getCombinations = async () => {
      return await page.evaluate(() => (globalThis as any).combinations);
    };

    await page.keyboard.press('Control+Shift+i');
    await page.keyboard.press('a');
    await page.keyboard.press('b');
    await page.keyboard.press('Meta+b');
    await page.keyboard.press('Meta+t');
    await page.keyboard.press('t');
    await page.keyboard.press('Alt+Shift+x');
    await page.keyboard.press('Alt+Shift+y');
    await page.keyboard.press('Meta+e');
    await page.keyboard.press('e');
    await page.keyboard.press('Escape');

    expect(await getCombinations()).toEqual({
      'ctrl+shift+i': 1,
      a: 1,
      b: 1,
      'cmd+t': 1,

      t: 1,

      'alt+shift+x': 1,
      'alt+shift+y': 1,
      'cmd+e': 1,
      e: 1,
      escape: 1,
    });
  });
});
