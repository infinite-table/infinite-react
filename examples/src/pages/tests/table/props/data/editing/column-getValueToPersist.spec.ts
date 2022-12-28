import { test, expect } from '@testing';

export default test.describe.parallel('Inline Edit', () => {
  test('should take into account getValueToPersist and getEditValue', async ({
    page,
    editModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const cellEditable1 = {
      colId: 'salary',
      rowIndex: 0,
    };

    let text = await rowModel.getTextForCell(cellEditable1);

    expect(text).toBe('$ 123');

    await editModel.startEdit({
      event: 'dblclick',
      ...cellEditable1,
    });

    // make sure column.getValueToEdit was called
    expect(await editModel.getValueInEditor(cellEditable1)).toBe('123');

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(true);

    await editModel.getCellEditor(cellEditable1).fill('456');

    await editModel.confirmEdit(cellEditable1);

    await page.waitForTimeout(20);

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(false);

    expect(await rowModel.getTextForCell(cellEditable1)).toBe('$ 456');
  });
});
