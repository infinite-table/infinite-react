import { test, expect } from '@testing';

export default test.describe.parallel('Load mask', () => {
  test('shows "Loading" when no loadingText is given', async ({ page }) => {
    await page.waitForInfiniteReady();

    const text = page.locator('.Infinite-LoadMask-Text');
    await expect(text).toBeVisible();
    await expect(text).toHaveText('Loading');

    // the mask goes away when the data arrives
    await expect(text).toBeHidden({ timeout: 2000 });
  });
});
