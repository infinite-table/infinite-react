import { test, expect } from '@testing';

export default test.describe('Pivot', () => {
  test('should show columns for pivot when there are no configured aggregation reducers', async ({
    page,
    columnModel,
    tableModel,
  }) => {
    await page.waitForInfinite(50);

    const header = await tableModel.withHeader();
    let columnGroupLabels = await columnModel.getVisibleColumnGroupLabels();

    expect(await header.getColumnHeaders()).toEqual([
      'Group by language',
      '-',
      '-',
      '-',
    ]);

    expect(columnGroupLabels).toEqual(['MIT License', 'BSD 3-Clause', 'Other']);
  });
});
