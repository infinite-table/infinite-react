import { test, expect } from '@playwright/test';

export default test.describe.parallel('DataSource', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/datasource/default`);
  });

  test.skip('should show loading for 2 seconds', async ({ page }) => {
    await expect(await page.content()).toContain('loading');

    await page.waitForTimeout(100);

    await expect(await page.content()).toContain('loading');

    await page.waitForTimeout(250);

    await expect(await page.content()).toContain('bob');
    await expect(await page.content()).toContain('bill');
  });
});
