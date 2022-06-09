import { test, expect } from '@testing';

export default test.describe.parallel('destroy cleanup', () => {
  test('brain should be destroyed', async ({ page }) => {
    await page.waitForInfinite();

    const destroyButton = page.locator('button');

    await destroyButton.click();

    expect(await page.evaluate(() => (window as any).brainDestroyed)).toBe(
      true,
    );
  });
});
