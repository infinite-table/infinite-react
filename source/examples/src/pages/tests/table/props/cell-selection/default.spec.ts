import { test } from '@testing';

export default test.describe.parallel('Cell Selection', () => {
  test('should work', async ({ page }) => {
    await page.waitForInfinite();
  });
});
