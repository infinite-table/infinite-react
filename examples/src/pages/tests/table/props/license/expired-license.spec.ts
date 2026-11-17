import { test, expect } from '@testing';

const WHITE = 'rgb(255, 255, 255)';
const BLACK = 'rgb(0, 0, 0)';

export default test.describe.parallel('Expired license', () => {
  test('shows the same footer as for a missing license', async ({ page }) => {
    await page.waitForInfinite();

    const footer = page.locator('.Infinite-Footer');

    await expect(footer).toBeVisible();
    await expect(footer).not.toHaveClass(/Infinite-Footer--invalid/);
    await expect(footer).toHaveText('Powered by Infinite Table');
    await expect(footer).toHaveCSS('background-color', WHITE);
    await expect(footer).toHaveCSS('color', BLACK);

    const link = footer.locator('a');
    await expect(link).toHaveAttribute('href', 'https://infinite-table.com');
    await expect(link).toBeVisible();
  });

  test('logs that the license has expired', async ({ page }) => {
    await page.waitForInfinite();

    const errors = page.getConsoleErrors().join('\n');

    expect(errors).toContain(
      'Your Infinite Table license has expired on Wed Nov 04 2026.',
    );
    expect(errors).toContain('to renew your license');
    expect(errors).not.toContain("You don't have a valid Infinite Table license");
  });
});
