import { test, expect } from '@testing';

export default test.describe
  .parallel('Group render strategy: Single Column with groupColumn prop', () => {
  test('Should apply groupColumn correctly', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const { getColumnHeaders } = tableModel.withHeader();

    expect(await getColumnHeaders()).toEqual([
      'The Group Column',
      'department',
      'team',
      'id',
      'name',
      'country',
      'salary',
    ]);

    expect(await tableModel.getVisibleColumnIds()).toEqual([
      'the-group',
      'department',
      'team',
      'id',
      'name',
      'country',
      'salary',
    ]);

    const groupCol = await tableModel.withColumn('the-group');
    expect(await groupCol.getCellValue({ rowIndex: 0 })).toEqual('it');
    expect(await groupCol.getCellValue({ rowIndex: 1 })).toEqual('backend');
    expect(await groupCol.getCellValue({ rowIndex: 2 })).toEqual('UK');

    expect(
      await groupCol.getCellComputedStyleProperty(
        {
          rowIndex: 0,
        },
        'color',
      ),
    ).toEqual('rgb(255, 0, 0)');

    expect(
      await groupCol.getCellComputedStyleProperty(
        {
          rowIndex: 1,
        },
        'color',
      ),
    ).toEqual('rgb(0, 255, 0)');

    expect(
      await groupCol.getCellComputedStyleProperty(
        {
          rowIndex: 6,
        },
        'color',
      ),
    ).toEqual('rgb(0, 255, 0)');
  });
});
