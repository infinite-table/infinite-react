import { test, expect } from '@testing';

export default test.describe.parallel('Pivot', () => {
  test('showSeparatePivotColumnForSingleAggregation true then false should have correct behavior', async ({
    page,
    columnModel,
    headerModel,
  }) => {
    await page.waitForInfinite(30);
    let columnIds = await columnModel.getVisibleColumnIds();
    let columnGroupIds = await columnModel.getVisibleColumnGroupIds();

    const expectedColumnIds = [
      'group-by-country',
      'group-by-stack',
      'salary:backend',
      'salary:frontend',
    ];
    expect(columnIds).toEqual(expectedColumnIds);
    expect(columnGroupIds).toEqual([
      'backend,salary:backend',
      'frontend,salary:frontend',
    ]);

    expect(
      await headerModel.getTextForHeaderCell({
        colId: 'salary:backend',
      }),
    ).toEqual('Salary (avg)');

    await page.click('button[data-name="toggle-show-separate"]');

    await page.waitForTimeout(30);

    columnIds = await columnModel.getVisibleColumnIds();
    columnGroupIds = await columnModel.getVisibleColumnGroupIds();

    // when there is only 1 aggregation and there are no column groups because showSeparatePivotColumnForSingleAggregation is false
    // in this case, the pivot column should header should be the value of the aggregation - in this case: backend or frontend
    expect(
      await headerModel.getTextForHeaderCell({
        colId: 'salary:backend',
      }),
    ).toEqual('backend');

    expect(columnIds).toEqual(expectedColumnIds);
    expect(columnGroupIds).toEqual([]);
  });

  test('showSeparatePivotColumnForSingleAggregation true then false + another pivot level', async ({
    page,
    columnModel,
  }) => {
    await page.waitForInfinite(30);
    await page.click('button[data-name="toggle-show-separate"]');

    let columnIds = await columnModel.getVisibleColumnIds();

    const expectedColumnIds = [
      'group-by-country',
      'group-by-stack',
      'salary:backend',
      'salary:frontend',
    ];

    expect(columnIds).toEqual(expectedColumnIds);

    await page.click('button[data-name="toggle-pivot-col"]');
    await page.waitForTimeout(30);

    columnIds = await columnModel.getVisibleColumnIds();

    expect(columnIds).toEqual([
      'group-by-country',
      'group-by-stack',
      'salary:backend/yes',
      'total:salary:backend',
      'salary:frontend/no',
      'salary:frontend/yes',
      'total:salary:frontend',
    ]);

    await page.click('button[data-name="toggle-total-col"]');
    await page.waitForTimeout(80);

    columnIds = await columnModel.getVisibleColumnIds();

    expect(columnIds).toEqual([
      'group-by-country',
      'group-by-stack',
      'salary:backend/yes',
      'salary:frontend/no',
      'salary:frontend/yes',
    ]);
  });
});
