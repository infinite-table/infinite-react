import { expect, test } from '@testing';

export default test.describe.parallel('DataSource.sortTypes', () => {
  test('should work properly with initial sortInfo', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const values = await rowModel.getTextForColumnCells({ colId: 'color' });

    // magenta comes first
    expect(values.slice(0, 2)).toEqual(['magenta', 'magenta']);
  });
});
