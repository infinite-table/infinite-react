import { test, expect } from '@testing';

export default test.describe
  .parallel('Group By with groupMode remote should trigger dataSource call', () => {
  test('should work fine', async ({ page }) => {
    await page.waitForInfinite();

    expect(
      await page.evaluate(() => {
        return (globalThis as any).callCount;
      }),
    ).toBe(1);

    expect(
      await page.evaluate(() => {
        return (globalThis as any).groupBy;
      }),
    ).toEqual([
      {
        field: 'year',
      },
    ]);

    await page.click('button');

    expect(
      await page.evaluate(() => {
        return (globalThis as any).callCount;
      }),
    ).toBe(2);

    expect(
      await page.evaluate(() => {
        return (globalThis as any).groupBy;
      }),
    ).toEqual([]);
  });
});
