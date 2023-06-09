import { test, expect } from '@testing';

export default test.describe
  .parallel('Group render strategy: Multi Column', () => {
  test('Should display cols properly and respect groupBy.column', async ({
    page,
    tableModel,
  }) => {
    await page.waitForInfinite();

    const { getColumnHeaders } = tableModel.withHeader();

    expect(await getColumnHeaders()).toEqual([
      'Department grouping',
      'Group by team',
      'department',
      'team',
      'id',
      'name',
      'country',
      'salary',
    ]);

    expect(await tableModel.getVisibleColumnIds()).toEqual([
      'dep-group',
      'group-by-team',
      'department',
      'team',
      'id',
      'name',
      'country',
      'salary',
    ]);

    const depGroupCol = tableModel.withColumn('dep-group');

    expect(await depGroupCol.getHeader()).toEqual('Department grouping');

    expect(await depGroupCol.getHeaderComputedStyleProperty('color')).toBe(
      'rgb(255, 0, 0)',
    );
    expect(
      await depGroupCol.getCellComputedStyleProperty({ rowIndex: 0 }, 'color'),
    ).toEqual('rgb(0, 255, 0)');
  });
});
