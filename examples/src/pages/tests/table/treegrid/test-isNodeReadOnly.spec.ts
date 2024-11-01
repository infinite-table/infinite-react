import { test, expect } from '@testing';

export default test.describe('isNodeReadOnly', () => {
  test('works as expected', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const cell = tableModel.withCell({
      rowIndex: 2,
      colIndex: 0,
    });

    expect(await cell.isTreeIconExpanded()).toBe(true);
    expect(await cell.isTreeIconDisabled()).toBe(true);

    await page.click('button:text("toggle")');

    expect(await cell.isTreeIconExpanded()).toBe(true);
    expect(await cell.isTreeIconDisabled()).toBe(false);
  });
});
