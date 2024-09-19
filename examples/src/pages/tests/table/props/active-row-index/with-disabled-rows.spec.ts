import { test, expect } from '@testing';

export default test.describe('Disabled rows', () => {
  test('should work fine', async ({ page, rowModel }) => {
    await page.waitForInfinite();

    expect(await rowModel.isRowDisabled(0)).toBe(false);
    expect(await rowModel.isRowDisabled(3)).toBe(true);

    await rowModel.clickRow(2);
    expect(await page.evaluate(() => (globalThis as any).activeRowIndex)).toBe(
      2,
    );

    // clicking a disabled row should not change the active row
    await rowModel.clickRow(3);
    expect(await page.evaluate(() => (globalThis as any).activeRowIndex)).toBe(
      2,
    );

    // arrow down should skip over disabled row
    await page.keyboard.press('ArrowDown');
    expect(await page.evaluate(() => (globalThis as any).activeRowIndex)).toBe(
      4,
    );

    // again, arrow down should skip over disabled rows
    await page.keyboard.press('ArrowDown');
    expect(await page.evaluate(() => (globalThis as any).activeRowIndex)).toBe(
      7,
    );
  });
});
