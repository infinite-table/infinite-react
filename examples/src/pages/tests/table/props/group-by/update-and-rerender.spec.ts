import { test, expect } from '@testing';

export default test.describe.parallel('Group By rerender on update', () => {
  test('should work correctly', async ({
    page,

    tableModel,
    editModel,
  }) => {
    await page.waitForInfinite();

    const ageColumn = tableModel.withColumn('age');

    const headerText = await ageColumn.getHeader();

    const ageRenderedValues = await ageColumn.getValues();

    const cellLocation = {
      colId: 'age',
      rowIndex: 2,
    };

    await editModel.startEdit({
      event: 'dblclick',
      ...cellLocation,
      value: '23',
    });

    await editModel.confirmEdit(cellLocation);

    const ageRenderedValuesAfter = await ageColumn.getValues();

    // the first 3 rows should have been rerendered
    expect(ageRenderedValuesAfter[0]).not.toEqual(ageRenderedValues[0]);
    expect(ageRenderedValuesAfter[1]).not.toEqual(ageRenderedValues[1]);
    expect(ageRenderedValuesAfter[2]).not.toEqual(ageRenderedValues[2]);

    // the rest remain the same
    expect(ageRenderedValuesAfter.slice(3)).toEqual(ageRenderedValues.slice(3));

    // value before edit
    expect(ageRenderedValues[1]?.split('-')[0]).toEqual('20');
    // value after edit
    expect(ageRenderedValuesAfter[1]?.split('-')[0]).toEqual('21');

    expect(await ageColumn.getHeader()).toEqual(headerText);
  });

  test('header should update when resizing column', async ({
    page,
    tableModel,
  }) => {
    await page.waitForInfinite();

    const ageColumn = tableModel.withColumn('age');

    const headerText = await ageColumn.getHeader();

    await ageColumn.resize(100);

    expect(await ageColumn.getHeader()).not.toEqual(headerText);
  });
});
