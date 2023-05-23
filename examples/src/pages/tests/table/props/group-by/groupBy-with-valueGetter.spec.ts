import { test, expect } from '@testing';

export default test.describe
  .parallel('Grouping with field and valueGetter, for multi-column rendering strategy', () => {
  test('if the groupBy has a field, in the cell of the referenced column when we are in a group row, it should render the respective field', async ({
    page,

    columnModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    // in this state, there is a groupBy, with a field

    // make expectations on the department column
    // expect cells in the department column, for group rows, to have the value of the department field
    let text = await rowModel.getTextForCell({
      rowIndex: 0,
      colId: 'department',
    });
    expect(text).toBe('it');

    text = await rowModel.getTextForCell({
      rowIndex: 1,
      colId: 'department',
    });
    expect(text).toBe('it');

    text = await rowModel.getTextForCell({
      rowIndex: 2,
      colId: 'department',
    });
    expect(text).toBe('it');

    // make expectations on the group column
    const color = await columnModel.getCellComputedStyleProperty(
      {
        colIndex: 0,
        rowIndex: 0,
      },
      'color',
    );
    expect(color).toBe('rgb(255, 0, 0)');
    expect(
      await rowModel.getTextForCell({
        rowIndex: 0,
        colIndex: 0,
      }),
    ).toBe('it');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 1,
        colIndex: 0,
      }),
    ).toBe('');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 2,
        colIndex: 0,
      }),
    ).toBe('');
  });

  test('if the groupBy has a valueGetter and a groupField that doesnt match a field, in the cell for the referenced column when we are in a group row, nothing should be rendered by default', async ({
    page,
    columnModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    // uncheck the "use field in groupBy" checkbox

    await page.getByLabel('Use field in groupBy').click();

    // we're in a situation where the groupBy has a valueGetter and a groupField that doesnt match an existing field
    // so cells for the department column, for group rows, will not have the value of the department field
    // as it's not set on the generated & aggregated data object corresponding to the data for the row

    // make expectations on the department column
    expect(
      await rowModel.getTextForCell({
        rowIndex: 0,
        colId: 'department',
      }),
    ).toBe('');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 1,
        colId: 'department',
      }),
    ).toBe('');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 2,
        colId: 'department',
      }),
    ).toBe('it');

    // make expectations on the group column
    let color = await columnModel.getCellComputedStyleProperty(
      {
        colIndex: 0,
        rowIndex: 0,
      },
      'color',
    );
    expect(color).not.toBe('rgb(255, 0, 0)');
    expect(
      await rowModel.getTextForCell({
        rowIndex: 0,
        colIndex: 0,
      }),
    ).toBe('Department: it-20');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 1,
        colIndex: 0,
      }),
    ).toBe('');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 2,
        colIndex: 0,
      }),
    ).toBe('');

    // check the "use known group field in groupBy" checkbox

    // in this case, the groupBy has a valueGetter and a groupField that DOES match an existing field

    // so cells for the department column, for group rows, will have the value of the groupBy.valueGetter
    // and not of the field

    await page.getByLabel('Use known group field in groupBy').click();

    // make expectations on the department column
    color = await columnModel.getCellComputedStyleProperty(
      {
        colIndex: 0,
        rowIndex: 0,
      },
      'color',
    );
    expect(color).toBe('rgb(255, 0, 0)');
    expect(
      await rowModel.getTextForCell({
        rowIndex: 0,
        colId: 'department',
      }),
    ).toBe('Department: it-20');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 1,
        colId: 'department',
      }),
    ).toBe('Department: it-20');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 2,
        colId: 'department',
      }),
    ).toBe('it');

    // make expectations on the group column
    expect(
      await rowModel.getTextForCell({
        rowIndex: 0,
        colIndex: 0,
      }),
    ).toBe('Department: it-20');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 1,
        colIndex: 0,
      }),
    ).toBe('');

    expect(
      await rowModel.getTextForCell({
        rowIndex: 2,
        colIndex: 0,
      }),
    ).toBe('');
  });
});
