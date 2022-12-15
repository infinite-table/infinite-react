import { test, expect } from '@testing';

export default test.describe.parallel('Inline Edit', () => {
  test('make sure column.style has access to rawValue correctly', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(
      await rowModel.getCellComputedStylePropertyValue(
        { rowIndex: 0, colId: 'salary' },
        'color',
      ),
    ).toBe('rgb(0, 0, 255)');

    expect(
      await rowModel.getCellComputedStylePropertyValue(
        { rowIndex: 1, colId: 'salary' },
        'color',
      ),
    ).toBe('rgb(255, 0, 0)');
  });

  test('make sure age column gets the rawValue (and not the formatted value) as the edit value', async ({
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

    expect(await editModel.getValueInEditor(cellEditable1)).toBe('123');

    await editModel.getCellEditor(cellEditable1).fill('234');
    await editModel.confirmEdit(cellEditable1);

    expect(await editModel.isEditorOpen(cellEditable1)).toBe(false);
    expect(await rowModel.getTextForCell(cellEditable1)).toBe('$ 468');
  });
});
