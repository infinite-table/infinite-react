import { test, expect } from '@testing';

export default test.describe.parallel('Keyboard shortcuts', () => {
  // this was shift+escape but for whatever reason playwright does not trigger shift+escape properly
  test('should trigger shift+enter', async ({ page, rowModel }) => {
    await page.waitForInfinite();
    const cell = {
      colId: 'age',
      rowIndex: 1,
    };
    await rowModel.clickCell(cell);

    await page.keyboard.press('Shift+Enter');
    await page.waitForTimeout(50);
    expect(
      await page.evaluate(() => {
        return (globalThis as any).working;
      }),
    ).toEqual(1);

    await page.keyboard.press('Shift+x');

    await page.keyboard.press('Shift+Enter');
    await page.waitForTimeout(50);
    expect(
      await page.evaluate(() => {
        return (globalThis as any).working;
      }),
    ).toEqual(2);
  });
});
