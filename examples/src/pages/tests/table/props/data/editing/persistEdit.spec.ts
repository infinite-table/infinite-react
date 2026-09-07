import { test, expect } from '@testing';

export default test.describe.parallel('Inline Edit', () => {
  test('should call and wait for async persistEdit correctly', { tag: '@perf' }, async ({
    page,
    editModel,
    rowModel,
    tracingModel,
  }) => {
    await page.waitForInfinite();

    const stop = await tracingModel.start();

    const cellEditable1 = {
      colId: 'firstName',
      rowIndex: 0,
    };

    await editModel.startEdit({
      event: 'dblclick',
      ...cellEditable1,
      value: 'Infinity',
    });

    const editor = editModel.getCellEditor(cellEditable1);
    await editor.type('x');
    await editor.press('Enter');

    // while persistEdit is pending (200ms), the editor stays mounted but readonly
    await expect(editor).toHaveAttribute('readonly', '');
    await page.keyboard.type('qqqqqq');
    await expect(editor).toHaveValue('Infinityx');

    // once persistEdit resolves, the editor is gone and the cell shows the persisted value
    await page.waitForTimeout(400);
    expect(await rowModel.getTextForCell(cellEditable1)).toBe('Infinityx!');

    let persistSuccessCalls = await page.evaluate(
      () => (window as any).onEditPersistSuccess.getCalls().length,
    );

    expect(persistSuccessCalls).toBe(1);

    await stop();
  });

  test('should not persist changes to the id column', { tag: '@perf' }, async ({
    page,
    editModel,
    rowModel,
    tracingModel,
  }) => {
    await page.waitForInfinite();
    const stop = await tracingModel.start();
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
    await stop();
  });
});
