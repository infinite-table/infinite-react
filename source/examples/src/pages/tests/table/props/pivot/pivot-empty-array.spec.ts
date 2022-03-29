import { getColumnGroupsIds, getHeaderColumnIds } from '../../../testUtils';
import { test, expect } from '@playwright/test';

export default test.describe.parallel('Pivot', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/props/pivot/pivot-empty-array`);

    await page.waitForSelector('[data-column-id]');
  });

  test('should show totals columns when they are configured to be visible', async ({
    page,
  }) => {
    let columnIds = await getHeaderColumnIds({ page });
    let columnGroupIds = await getColumnGroupsIds({ page });

    expect(columnIds).toEqual([
      'group-by-country',
      'total:salary',
      'total:age',
    ]);

    expect(columnGroupIds).toEqual([]);

    // toggles show totals to false
    await page.click('button');

    columnIds = await getHeaderColumnIds({ page });
    columnGroupIds = await getColumnGroupsIds({ page });

    expect(columnIds).toEqual(['group-by-country']);
    expect(columnGroupIds).toEqual([]);
  });
});
