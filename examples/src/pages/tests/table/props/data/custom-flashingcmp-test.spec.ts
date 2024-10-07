import { test, expect } from '@testing';

export default test.describe.parallel('Flashing', () => {
  test('should work immediately after update, not only when changing the active cell away from the edited cell', async ({
    page,
    editModel,
    tableModel,
  }) => {
    await page.waitForInfinite();

    const cell = await tableModel.withCell({
      rowIndex: 0,
      colId: 'monthlyBonus',
    });

    let value = await cell.getLocator().textContent();

    expect(value).toBe('1000-1000');

    await editModel.startEdit({
      event: 'enter',
      value: '234',
      rowIndex: 0,
      colId: 'monthlyBonus',
    });
    await editModel.confirmEdit({
      rowIndex: 0,
      colId: 'monthlyBonus',
    });

    await page.waitForTimeout(50);
    value = await cell.getLocator().textContent();

    expect(value).toBe('234-234');

    let backgroundColor = await cell.getComputedStyleProperty(
      'backgroundColor',
    );
    expect(backgroundColor).toBe('rgb(0, 0, 255)');

    await page.waitForTimeout(100);
    backgroundColor = await cell.getComputedStyleProperty('backgroundColor');
    expect(backgroundColor).not.toBe('rgb(0, 0, 255)');
  });
});
