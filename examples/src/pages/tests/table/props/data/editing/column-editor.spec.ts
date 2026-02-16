import { test, expect } from '@testing';
export default test.describe.parallel('Inline Edit', () => {
  test('should use custom editor when configured', async ({
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

    await page.waitForTimeout(100);
    await editModel.getCellEditor(cellEditable1).type('x');
    await editModel.confirmEdit(cellEditable1);

    // make sure column was using custom editor
    expect(await rowModel.getTextForCell(cellEditable1)).toBe('InfinityxABC');

    const cellEditable2 = {
      colId: 'currency',
      rowIndex: 0,
    };

    await editModel.startEdit({
      event: 'dblclick',
      ...cellEditable2,
      value: 'test',
    });

    await page.waitForTimeout(100);
    await editModel.confirmEdit(cellEditable2);

    // make sure this second column was using default editor
    expect(await rowModel.getTextForCell(cellEditable2)).toBe('test');

    await stop();
  });
});
