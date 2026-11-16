import { test, expect } from '@testing';

export default test.describe.parallel('Density', () => {
  test('changing the density changes the row height, with no errors', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    // a ResizeObserver loop error is dispatched as an error event on window
    await page.evaluate(() => {
      (globalThis as any).windowErrors = [];
      window.addEventListener('error', (event) => {
        (globalThis as any).windowErrors.push(event.message);
      });
    });
    const getErrors = () =>
      page.evaluate(() => (globalThis as any).windowErrors);

    const comfortable = await rowModel.getRowHeight(0);

    await page.locator('[data-name="density-compact"]').click();
    await expect.poll(() => rowModel.getRowHeight(0)).toBeLessThan(comfortable);

    await page.locator('[data-name="density-spacious"]').click();
    await expect
      .poll(() => rowModel.getRowHeight(0))
      .toBeGreaterThan(comfortable);

    await page.locator('[data-name="density-comfortable"]').click();
    await expect.poll(() => rowModel.getRowHeight(0)).toBe(comfortable);

    // the rows are laid out with the new height
    const top = (rowIndex: number) =>
      rowModel
        .getCellLocator({ rowIndex, colIndex: 0 })
        .evaluate((node) => node.getBoundingClientRect().top);
    expect((await top(1)) - (await top(0))).toBe(comfortable);

    await page.waitForTimeout(100);
    expect(await getErrors()).toEqual([]);
    expect(page.getConsoleErrors()).toEqual([]);
  });
});
