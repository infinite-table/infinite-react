import { test, expect } from '@testing';

export default test.describe
  .parallel('tree virtualization for horizontal layout mode', () => {
  test('should work fine', async ({ page, tableModel, rowModel }) => {
    await page.waitForInfinite();

    const c1 = tableModel.withCell({
      rowIndex: 1,
      colIndex: 1,
    });

    const c0 = tableModel.withCell({
      rowIndex: 0,
      colIndex: 1,
    });

    expect(await rowModel.getRenderedRowCount()).toBe(3);

    // expand the second row
    await c1.clickDetailIcon();
    // and expect the row count to grow
    expect(await rowModel.getRenderedRowCount()).toBe(24);

    // expand the first row
    await c0.clickDetailIcon();
    // and expect the row count to grow again
    expect(await rowModel.getRenderedRowCount()).toBe(34);

    // collapse the first row
    await c0.clickDetailIcon();
    // and expect the row count to shrink to what we previously had
    expect(await rowModel.getRenderedRowCount()).toBe(24);
  });
});
