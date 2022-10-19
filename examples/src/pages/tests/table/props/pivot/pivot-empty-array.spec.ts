import { test, expect } from '@testing';

export default test.describe.parallel('Pivot', () => {
  test('should show totals columns when they are configured to be visible', async ({
    page,
    columnModel,
  }) => {
    await page.waitForInfinite();

    let columnIds = await columnModel.getVisibleColumnIds();
    let columnGroupIds = await columnModel.getVisibleColumnGroupIds();

    expect(columnIds).toEqual([
      'group-by-country',
      'total:salary',
      'total:age',
    ]);

    expect(columnGroupIds).toEqual([]);

    // toggles show totals to false
    await page.click('button');

    columnIds = await columnModel.getVisibleColumnIds();
    columnGroupIds = await columnModel.getVisibleColumnGroupIds();

    expect(columnIds).toEqual(['group-by-country']);
    expect(columnGroupIds).toEqual([]);
  });
});
