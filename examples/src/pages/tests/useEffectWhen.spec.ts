import { expect, test } from '@testing';

export default test.describe.parallel('useEffectWhen', () => {
  test('should work', async ({ page }) => {
    await page.load();
    await page.waitForSelector('button');

    let effectCalls = await page.evaluate(() => {
      return (globalThis as any).effectCalls;
    });
    await page.getByText('inc1').click();
    await page.getByText('inc1').click();

    effectCalls = await page.evaluate(() => {
      return (globalThis as any).effectCalls;
    });

    expect(effectCalls).toBe(0);

    await page.getByText('re-render').click();
    await page.getByText('re-render').click();
    await page.getByText('re-render').click();

    effectCalls = await page.evaluate(() => {
      return (globalThis as any).effectCalls;
    });

    expect(effectCalls).toBe(0);

    await page.getByText('inc2').click();
    await page.getByText('inc2').click();
    await page.getByText('inc2').click();
    await page.getByText('inc2').click();

    effectCalls = await page.evaluate(() => {
      return (globalThis as any).effectCalls;
    });

    expect(effectCalls).toBe(4);

    await page.getByText('inc1').click();
    await page.getByText('re-render').click();

    effectCalls = await page.evaluate(() => {
      return (globalThis as any).effectCalls;
    });

    expect(effectCalls).toBe(4);
  });
});
