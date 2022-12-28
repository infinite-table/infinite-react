import { test, expect } from '@testing';

export default test.describe.parallel('Inline Edit', () => {
  test('should take into account async getValueToPersist and getEditValue', async ({
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

    await page.waitForTimeout(100);

    // the column.getValueForEdit has a 200ms delay
    // so at 100ms mark we expect the editor to be still not visible
    expect(await rowModel.getTextForCell(cellEditable1)).toBe('$ 123');
    expect(await editModel.isEditorOpen(cellEditable1)).toBe(false);

    await page.waitForTimeout(100);

    // make sure column.getValueToEdit was called
    expect(await editModel.getValueInEditor(cellEditable1)).toBe('123');
    expect(await editModel.isEditorOpen(cellEditable1)).toBe(true);

    await editModel.getCellEditor(cellEditable1).fill('456');

    await editModel.confirmEdit(cellEditable1);

    await page.waitForTimeout(100);

    // the column.getValueToPersist has a 200ms delay
    // so at 100ms mark we expect the editor to be still visible
    expect(await editModel.isEditorOpen(cellEditable1)).toBe(true);
    // and the value in the editor to be the same
    expect(await editModel.getValueInEditor(cellEditable1)).toBe('456');
    // and the cell to not have the value rendered, while editor is visible
    expect(await rowModel.getTextForCell(cellEditable1)).toBe('');

    await page.waitForTimeout(100);

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(false);
    expect(await rowModel.getTextForCell(cellEditable1)).toBe('$ 456');
  });
});
