import { test, expect } from '@testing';
import { getScrollerLocator } from '../../testUtils';

export default test.describe.parallel('tree virtualization', () => {
  test('should work well', async ({ page, rowModel, tableModel }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toBe(4);

    const c0 = tableModel.withCell({
      rowIndex: 0,
      colIndex: 0,
    });

    await c0.clickDetailIcon();

    const workCell = tableModel.withCell({
      rowIndex: 2,
      colIndex: 0,
    });

    expect(await workCell.getValue()).toBe('Work');

    expect(await rowModel.getRenderedRowCount()).toBe(6);

    await workCell.getLocator().click();

    await workCell.clickDetailIcon();

    expect(await rowModel.getRenderedRowCount()).toBe(8);

    await workCell.getLocator().press('ArrowLeft', {
      delay: 50,
    });

    const scroller = await getScrollerLocator({ page });

    await scroller.hover();

    await page.keyboard.down('Shift');
    page.mouse.wheel(-900, 0);
    await page.keyboard.up('Shift');

    await page.waitForTimeout(250);

    expect(await c0.isVisible()).toBe(true);
  });
});
