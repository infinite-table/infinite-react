import { expect, test } from '@testing';

export default test.describe.parallel('useEffectWhenSameDeps', () => {
  test('should work', async ({ page }) => {
    await page.load();
    await page.waitForSelector('button');

    let effectCalls = await page.evaluate(() => {
      return (globalThis as any).effectCalls;
    });
    await page.getByText('inc').click();
    await page.getByText('inc').click();

    effectCalls = await page.evaluate(() => {
      return (globalThis as any).effectCalls;
    });

    expect(effectCalls).toBe(0);

    await expect(page.locator('body')).toContainText('counter 2');

    await page.getByText('re-render').click();
    await page.getByText('re-render').click();
    await page.getByText('re-render').click();

    effectCalls = await page.evaluate(() => {
      return (globalThis as any).effectCalls;
    });

    expect(effectCalls).toBe(3);
  });
});
