import { test, expect } from '@testing';

const PALE_RED_BG = 'rgb(254, 226, 226)';
const DARK_RED = 'rgb(153, 27, 27)';

export default test.describe.parallel('Invalid license', () => {
  test('shows the invalid license footer', async ({ page }) => {
    await page.waitForInfinite();

    const footer = page.locator('.Infinite-Footer');

    await expect(footer).toBeVisible();
    await expect(footer).toHaveClass(/Infinite-Footer--invalid/);
    await expect(footer).toHaveText(
      'Invalid Infinite Table license. See console for details. Powered by Infinite Table',
    );
    await expect(footer).toHaveCSS('background-color', PALE_RED_BG);
    await expect(footer).toHaveCSS('color', DARK_RED);

    const link = footer.locator('a');
    await expect(link).toHaveAttribute('href', 'https://infinite-table.com');
    await expect(link).toBeVisible();
    await expect(link).toHaveCSS('color', DARK_RED);
  });

  test('the license footer cannot be hidden or restyled with inline styles', async ({
    page,
  }) => {
    await page.waitForInfinite();

    const footer = page.locator('.Infinite-Footer');
    await expect(footer).toBeVisible();

    await footer.evaluate((node: HTMLElement) => {
      node.style.setProperty('display', 'none', 'important');
      node.style.setProperty('background', 'white', 'important');
      node.querySelector('a')!.style.setProperty(
        'visibility',
        'hidden',
        'important',
      );
    });

    // the grid enforces the footer styles every second
    await expect(footer).toBeVisible({ timeout: 3000 });
    await expect(footer).toHaveCSS('background-color', PALE_RED_BG, {
      timeout: 3000,
    });
    await expect(footer.locator('a')).toBeVisible({ timeout: 3000 });
  });


  test('logs that there is no valid license', async ({ page }) => {
    await page.waitForInfinite();

    const errors = page.getConsoleErrors().join('\n');

    expect(errors).toContain("You don't have a valid Infinite Table license");
    expect(errors).not.toContain('has expired');
  });
});
