import { test, expect } from '@testing';
export default test.describe.parallel('Inline Edit - shouldAcceptEdit', () => {
  test('should reject edit on id column immediately', async ({
    page,
    editModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const cellEditable1 = {
      colId: 'id',
      rowIndex: 0,
    };

    let text = await rowModel.getTextForCell(cellEditable1);

    expect(text).toBe('1');

    await editModel.startEdit({
      event: 'dblclick',
      value: 'testing value',
      ...cellEditable1,
    });

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(true);

    await editModel.confirmEdit(cellEditable1);

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(false);

    expect(await rowModel.getTextForCell(cellEditable1)).toBe('1');
  });

  test('should reject edit on currency column after 200ms', async ({
    page,
    editModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const cellEditable1 = {
      colId: 'currency',
      rowIndex: 0,
    };

    let text = await rowModel.getTextForCell(cellEditable1);
    expect(text).toBe('USDx');

    await editModel.startEdit({
      event: 'dblclick',
      value: 'testing value',
      ...cellEditable1,
    });

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(true);

    await editModel.confirmEdit(cellEditable1);

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(true);

    // editor is still open, so the value is not actually rendered
    expect(await rowModel.getTextForCell(cellEditable1)).toBe('');

    await page.waitForTimeout(40);

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(true);

    await page.waitForTimeout(120);

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(false);

    text = await rowModel.getTextForCell(cellEditable1);

    expect(text).toBe('USDx');
  });

  test('should accept edit on firstName column after 200ms', async ({
    page,
    editModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const cellEditable1 = {
      colId: 'firstName',
      rowIndex: 0,
    };

    let text = await rowModel.getTextForCell(cellEditable1);

    expect(text).toBe('John');

    await editModel.startEdit({
      event: 'dblclick',
      value: 'testing value',
      ...cellEditable1,
    });

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(true);

    await editModel.confirmEdit(cellEditable1);

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(true);

    // editor is still open, so the value is not actually rendered
    expect(await rowModel.getTextForCell(cellEditable1)).toBe('');

    await page.waitForTimeout(100);

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(true);

    await page.waitForTimeout(120);

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(false);

    text = await rowModel.getTextForCell(cellEditable1);

    expect(text).toBe('testing value');
  });

  test('should accept edit on stack column immediately', async ({
    page,
    editModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const cellEditable1 = {
      colId: 'stack',
      rowIndex: 0,
    };

    let text = await rowModel.getTextForCell(cellEditable1);

    expect(text).toBe('frontend');

    await editModel.startEdit({
      event: 'dblclick',
      value: 'fullstack',
      ...cellEditable1,
    });

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(true);

    await editModel.confirmEdit(cellEditable1);

    expect(await rowModel.getTextForCell(cellEditable1)).toBe('fullstack');
  });
});
