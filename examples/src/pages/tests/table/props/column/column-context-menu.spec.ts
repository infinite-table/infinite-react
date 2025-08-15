import { test, expect } from '@testing';

export default test.describe.parallel('Column context menu', () => {
  test('should not contain sorting items for non sortable columns', async ({
    page,

    headerModel,
  }) => {
    await page.waitForInfinite();

    await headerModel.openColumnMenu('firstName');

    expect(await headerModel.getMenuItems()).toStrictEqual([
      'Clear Filter',
      'Pin to start',
      'Unpin',
      'Columns',
      'Group by',
      'Close',
    ]);
  });

  test('should contain sorting items for sortable columns', async ({
    page,

    headerModel,
  }) => {
    await page.waitForInfinite();

    await headerModel.openColumnMenu('country');

    expect(await headerModel.getMenuItems()).toStrictEqual([
      'Sort Ascending',
      'Sort Descending',
      'Unsort',
      'Clear Filter',
      'Pin to start',
      'Unpin',
      'Columns',
      'Group by',
      'Close',
    ]);
  });
});
