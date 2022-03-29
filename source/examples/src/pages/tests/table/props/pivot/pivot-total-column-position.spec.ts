import { getColumnGroupsIds, getHeaderColumnIds } from '../../../testUtils';
import { test, expect } from '@playwright/test';

export default test.describe.parallel('Pivot', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/props/pivot/pivot-total-column-position`);

    await page.waitForSelector('[data-column-id]');
  });

  test('totals columns not needed when pivotBy.length < 2', async ({
    page,
  }) => {
    let columnIds = await getHeaderColumnIds({ page });
    let columnGroupIds = await getColumnGroupsIds({ page });

    const expectedColumnIds = [
      'group-by-country',
      'salary:backend',
      'age:backend',

      'salary:frontend',
      'age:frontend',

      'total:salary',
      'total:age',
    ];
    const expectedGroupIds = ['backend', 'frontend'];
    expect(columnIds).toEqual(expectedColumnIds);
    expect(columnGroupIds).toEqual(expectedGroupIds);

    // toggles show totals to true
    await page.click('button[data-name="toggle-show-totals"]');

    columnIds = await getHeaderColumnIds({ page });
    columnGroupIds = await getColumnGroupsIds({ page });

    // show totals true in this case should only grand total columns be visible but not normal total columns
    // as show totals will cause totals columns be visible only when pivotBy.length > 1
    expect(columnIds).toEqual(expectedColumnIds);
    expect(columnGroupIds).toEqual(expectedGroupIds);
  });

  test('totals columns are displayed correctly when pivotBy.length > 1', async ({
    page,
  }) => {
    let columnIds = await getHeaderColumnIds({ page });
    let columnGroupIds = await getColumnGroupsIds({ page });

    expect(columnIds).toEqual([
      'group-by-country',
      'salary:backend',
      'age:backend',
      'salary:frontend',
      'age:frontend',
      'total:salary',
      'total:age',
    ]);
    const expectedGroupIds = ['backend', 'frontend'];
    expect(columnGroupIds).toEqual(expectedGroupIds);

    // toggles pivot for "canDesign" field
    await page.click('button[data-name="toggle-can-design"]');

    columnIds = await getHeaderColumnIds({ page });
    columnGroupIds = await getColumnGroupsIds({ page });

    expect(columnIds).toEqual([
      'group-by-country',
      'salary:backend/yes',
      'age:backend/yes',
      'salary:frontend/no',
      'age:frontend/no',
      'total:salary',
      'total:age',
    ]);

    expect(columnGroupIds).toEqual([
      'backend',
      'backend/yes',
      'frontend',
      'frontend/no',
    ]);

    // toggles show totals to true
    await page.click('button[data-name="toggle-show-totals"]');

    columnIds = await getHeaderColumnIds({ page });
    columnGroupIds = await getColumnGroupsIds({ page });

    expect(columnIds).toEqual([
      'group-by-country',
      'salary:backend/yes',
      'age:backend/yes',
      'total:salary:backend',
      'total:age:backend',
      'salary:frontend/no',
      'age:frontend/no',
      'total:salary:frontend',
      'total:age:frontend',
      'total:salary',
      'total:age',
    ]);

    expect(columnGroupIds).toEqual([
      'backend',
      'backend/yes',
      'total:backend',
      'frontend',
      'frontend/no',
      'total:frontend',
    ]);
  });
});
