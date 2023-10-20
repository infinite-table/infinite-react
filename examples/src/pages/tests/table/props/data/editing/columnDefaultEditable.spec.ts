import { test, expect } from '@testing';

export default test.describe.parallel('Inline Edit', () => {
  test('should start by dblclick, and a basic edit should go through', async ({
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
      value: 'testing',
      ...cellEditable1,
    });

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(true);

    await editModel.confirmEdit(cellEditable1);

    await page.waitForTimeout(50);

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(false);

    let editAcceptedCalls = await page.evaluate(
      () => (window as any).onEditAccepted.getCalls().length,
    );

    expect(editAcceptedCalls).toBe(1);

    text = await rowModel.getTextForCell(cellEditable1);

    expect(text).toBe('testing');

    const cellUneditable = {
      colId: 'id',
      rowIndex: 0,
    };

    await editModel.startEdit({
      event: 'dblclick',
      ...cellUneditable,
    });

    expect(await editModel.isEditorOpen(cellUneditable)).toBe(false);
  });

  test('Escape key should cancel the edit', async ({
    rowModel,
    editModel,
    page,
  }) => {
    await page.waitForInfinite();

    const cellEditable1 = {
      colId: 'firstName',
      rowIndex: 0,
    };

    expect(await rowModel.getTextForCell(cellEditable1)).toBe('John');

    // start edit the cell and the cancelEdit
    await editModel.startEdit({
      event: 'dblclick',
      value: 'testing',
      ...cellEditable1,
    });

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(true);
    await editModel.cancelEdit(cellEditable1);
    expect(await editModel.isEditorOpen(cellEditable1)).toBe(false);

    expect(await rowModel.getTextForCell(cellEditable1)).toBe('John');

    let cancelledCalls = await page.evaluate(
      () => (window as any).onEditCancelled.getCalls().length,
    );

    expect(cancelledCalls).toBe(1);
  });

  test('expect style to be applied when editing - edit started by Enter key', async ({
    page,
    rowModel,
    editModel,
  }) => {
    await page.waitForInfinite();

    const cellEditable1 = {
      colId: 'firstName',
      rowIndex: 1,
    };

    await editModel.startEdit({
      event: 'enter',
      value: 'xyz',
      ...cellEditable1,
    });

    let fontSize = await rowModel.getCellComputedStylePropertyValue(
      cellEditable1,
      'font-size',
    );

    expect(fontSize).toBe('30px');

    await editModel.confirmEdit(cellEditable1);

    fontSize = await rowModel.getCellComputedStylePropertyValue(
      cellEditable1,
      'font-size',
    );

    expect(fontSize).not.toBe('30px');
    expect(await rowModel.getTextForCell(cellEditable1)).toBe('xyz');
  });
});
