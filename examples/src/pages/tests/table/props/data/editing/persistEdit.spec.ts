import { test, expect } from '@testing';

export default test.describe.parallel('Inline Edit', () => {
  test('should call and wait for async persistEdit correctly', async ({
    page,
    editModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const cellEditable1 = {
      colId: 'firstName',
      rowIndex: 0,
    };

    await editModel.startEdit({
      event: 'dblclick',
      ...cellEditable1,
      value: 'Infinity',
    });

    await editModel.getCellEditor(cellEditable1).type('x'),
      await editModel.confirmEdit(cellEditable1);

    // at the 100ms mark, expect the editor to still be around
    await page.waitForTimeout(100);

    // the editor should be readonly at this point
    await editModel.getCellEditor(cellEditable1).type('qqqqqq');

    await page.waitForTimeout(20);

    expect(await editModel.getValueInEditor(cellEditable1)).toBe('Infinityx');

    await page.waitForTimeout(90);

    expect(await rowModel.getTextForCell(cellEditable1)).toBe('Infinityx!');

    let persistSuccessCalls = await page.evaluate(
      () => (window as any).onEditPersistSuccess.getCalls().length,
    );

    expect(persistSuccessCalls).toBe(1);
  });

  test('should not persist changes to the id column', async ({
    page,
    editModel,
    rowModel,
  }) => {
    await page.waitForInfinite();
    const cellEditable1 = {
      colId: 'id',
      rowIndex: 0,
    };

    await editModel.startEdit({
      event: 'dblclick',
      ...cellEditable1,
      value: 'test',
    });

    await editModel.confirmEdit(cellEditable1);

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(false);
    expect(await rowModel.getTextForCell(cellEditable1)).toBe('1');

    let persistErrorCalls = await page.evaluate(
      () => (window as any).onEditPersistError.getCalls().length,
    );

    expect(persistErrorCalls).toBe(1);
  });
});
