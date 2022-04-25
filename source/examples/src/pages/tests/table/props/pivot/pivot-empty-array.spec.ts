import { test, expect } from '@testing';

import { getColumnGroupsIds, getHeaderColumnIds } from '../../../testUtils';

export default test.describe.parallel('Pivot', () => {
  test('should show totals columns when they are configured to be visible', async ({
    page,
  }) => {
    await page.waitForInfinite();
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
