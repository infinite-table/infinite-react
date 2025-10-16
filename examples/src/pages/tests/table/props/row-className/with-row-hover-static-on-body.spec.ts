import { test, expect } from '@testing';

export default test.describe
  .parallel('rowClassName and rowHoverClassName', () => {
  test('are correctly applied', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const cell = tableModel.withCell({
      colIndex: 0,
      rowIndex: 0,
    });

    const locator = cell.getLocator();

    const cls = await locator.getAttribute('class');

    expect(cls).toContain('custom-row');
    expect(cls).not.toContain('hover-row');
    expect(cls).not.toContain('InfiniteColumnCell--hovered');

    await locator.hover();

    await page.waitForTimeout(50);

    const newCls = await locator.getAttribute('class');
    expect(newCls).toContain('InfiniteColumnCell--hovered');
    expect(newCls).toContain('hover-row');
    expect(newCls).toContain('custom-row');
  });
});
