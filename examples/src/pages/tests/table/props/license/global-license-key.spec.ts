import { test, expect } from '@testing';

export default test.describe.parallel('Global license key', () => {
  test('without a licenseKey prop, the grid uses InfiniteTable.licenseKey and shows no footer', async ({
    page,
  }) => {
    await page.waitForInfinite();

    // the footer is rendered in the same commit as the grid, so it would be there by now
    await expect(page.locator('.Infinite-Footer')).toHaveCount(0);
  });
});
