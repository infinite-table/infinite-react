import { test, expect } from '@testing';

export default test.describe('Keyboard shortcuts', () => {
  test('should work', async ({ page }) => {
    await page.load();
    await page.waitForFunction(() => (globalThis as any).hotkeyReady);
    const getCombinations = async () => {
      return await page.evaluate(() => (globalThis as any).combinations);
    };
    const options = {
      delay: 20,
    };

    await page.keyboard.press('Control+Shift+i', options);
    await page.keyboard.press('a', options);
    await page.keyboard.press('b', options);
    await page.keyboard.press('Meta+b', options);
    await page.keyboard.press('Meta+t', options);
    await page.keyboard.press('t', options);
    await page.keyboard.press('Alt+Shift+x', options);
    await page.keyboard.press('Alt+Shift+y', options);
    await page.keyboard.press('Meta+e', options);
    await page.keyboard.press('e', options);
    await page.keyboard.press('Escape', options);

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
