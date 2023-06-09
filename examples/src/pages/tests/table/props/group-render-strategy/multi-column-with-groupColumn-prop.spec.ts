import { test, expect } from '@testing';

export default test.describe
  .parallel('Group render strategy: Multi Column with groupColumn prop', () => {
  test('Should apply groupColumn on top of groupBy.column', async ({
    page,
    tableModel,
  }) => {
    await page.waitForInfinite();

    const { getColumnHeaders } = tableModel.withHeader();

    expect(await getColumnHeaders()).toEqual([
      'Department grouping',
      'Group by team',
      'Group by country',
      'department',
      'team',
      'id',
      'name',
    ]);

    expect(await tableModel.getVisibleColumnIds()).toEqual([
      'xx-dep-xx',
      'my-custom-team-group',
      'group-by-country',
      'department',
      'team',
      'id',
      'name',
    ]);

    const teamCol = await tableModel.withColumn('my-custom-team-group');
    expect(await teamCol.getCellValue({ rowIndex: 1 })).toEqual('backend');
    expect(
      await teamCol.getCellComputedStyleProperty(
        {
          rowIndex: 1,
        },
        'color',
      ),
    ).toEqual('rgb(0, 100, 0)');

    expect(await teamCol.getHeaderComputedStyleProperty('color')).toEqual(
      'rgb(255, 0, 0)',
    );
  });
});
