import { test, expect } from '@testing';

export default test.describe.parallel('Lazy multi-row selection with group keys', () => {
  test('selecting a group keeps the selection of unloaded rows in sibling groups', async ({
    page,
    rowModel,
    columnModel,
  }) => {
    await page.waitForInfinite();

    const groupCell = (rowIndex: number) =>
      columnModel.getCellLocator({ rowIndex, colIndex: 0 });
    const checkboxState = (rowIndex: number) =>
      groupCell(rowIndex)
        .locator('input[type="checkbox"]')
        .evaluate((input: HTMLInputElement) =>
          input.indeterminate ? null : input.checked,
        );

    await expect(groupCell(0)).toContainText('backend');
    await rowModel.toggleGroupRow(0);

    await expect(groupCell(1)).toContainText('CSharp');
    await expect(groupCell(5)).toContainText('PHP');

    expect(await checkboxState(1)).toBe(null);
    expect(await checkboxState(5)).toBe(null);

    await groupCell(1).locator('input[type="checkbox"]').click();

    await expect.poll(() => checkboxState(1)).toBe(true);
    expect(await checkboxState(5)).toBe(null);
    expect(await checkboxState(0)).toBe(null);

    const rowSelection = await page.evaluate(() => (globalThis as any).rowSelection);
    expect(rowSelection.selectedRows).toContainEqual(['backend', 'PHP', 'no', 66]);
    expect(rowSelection.selectedRows).toContainEqual(['backend', 'CSharp']);
  });
});
