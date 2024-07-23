import { test, expect } from '@testing';

export default test.describe.parallel('DataSource', () => {
  test('should show loading for 2 seconds', async ({ page }) => {
    await page.load();
    const container = page.getByLabel('container');

    await expect(await container.textContent()).toContain('loading');

    await page.waitForTimeout(20);

    await expect(await container.textContent()).toContain('loading');

    await page.waitForTimeout(200);

    await expect(await container.textContent()).toContain('bob');
    await expect(await container.textContent()).toContain('bill');
  });
});
