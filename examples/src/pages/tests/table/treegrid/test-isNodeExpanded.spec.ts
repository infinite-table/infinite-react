import { test, expect } from '@testing';

export default test.describe('isNodeExpanded', () => {
  test('works as expected', async ({ page, rowModel, tableModel }) => {
    await page.waitForInfinite();

    const cell = tableModel.withCell({
      rowIndex: 2,
      colIndex: 0,
    });

    const collapsedNode = tableModel.withCell({
      rowIndex: 3,
      colIndex: 0,
    });

    expect(await rowModel.getRenderedRowCount()).toBe(5);
    expect(await cell.isTreeIconExpanded()).toBe(false);
    expect(await collapsedNode.isTreeIconExpanded()).toBe(false);

    await page.click('button:text("expand all")');

    expect(await rowModel.getRenderedRowCount()).toBe(6);
    expect(await cell.isTreeIconExpanded()).toBe(false);
    expect(await collapsedNode.isTreeIconExpanded()).toBe(true);
  });
});
