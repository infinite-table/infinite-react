import { test } from '@testing';

export default test.describe.parallel('Row Selection', () => {
  test('should work', async ({ page }) => {
    await page.waitForInfinite();
  });
});
