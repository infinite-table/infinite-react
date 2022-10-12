import { test, expect } from '@testing';

import {
  getColumnCells,
  getColumnGroupsIds,
  getHeaderColumnIds,
} from '../../../testUtils';

export default test.describe.parallel('Pivot', () => {
  test('showSeparatePivotColumnForSingleAggregation true then false should have correct behavior', async ({
    page,
  }) => {
    await page.waitForInfinite();
    let columnIds = await getHeaderColumnIds({ page });
    let columnGroupIds = await getColumnGroupsIds({ page });

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

    const { headerCell: salaryBackend } = await getColumnCells(
      'salary:backend',
      {
        page,
      },
    );

    expect(await salaryBackend.innerText()).toEqual('Salary (avg)');

    await page.click('button[data-name="toggle-show-separate"]');

    columnIds = await getHeaderColumnIds({ page });
    columnGroupIds = await getColumnGroupsIds({ page });

    const { headerCell: salaryBackend2 } = await getColumnCells(
      'salary:backend',
      {
        page,
      },
    );

    // when there is only 1 aggregation and there are no column groups because showSeparatePivotColumnForSingleAggregation is false
    // in this case, the pivot column should header should be the value of the aggregation - in this case: backend or frontend
    expect(await salaryBackend2.innerText()).toEqual('backend');

    expect(columnIds).toEqual(expectedColumnIds);
    expect(columnGroupIds).toEqual([]);
  });

  test('showSeparatePivotColumnForSingleAggregation true then false + another pivot level', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await page.click('button[data-name="toggle-show-separate"]');

    let columnIds = await getHeaderColumnIds({ page });

    const expectedColumnIds = [
      'group-by-country',
      'group-by-stack',
      'salary:backend',
      'salary:frontend',
    ];

    expect(columnIds).toEqual(expectedColumnIds);

    await page.click('button[data-name="toggle-pivot-col"]');

    columnIds = await getHeaderColumnIds({ page });

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

    columnIds = await getHeaderColumnIds({ page });

    expect(columnIds).toEqual([
      'group-by-country',
      'group-by-stack',
      'salary:backend/yes',
      'salary:frontend/no',
      'salary:frontend/yes',
    ]);
  });
});
