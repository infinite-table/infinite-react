import { expect, test } from '@testing';

export default test.describe.parallel('DataSource.sortTypes', () => {
  test('should work properly', async ({ page, headerModel, rowModel }) => {
    await page.waitForInfinite();
    await headerModel.clickColumnHeader({ colId: 'color' });

    const values = await rowModel.getTextForColumnCells({ colId: 'color' });

    // magenta comes first
    expect(values.slice(0, 2)).toEqual(['magenta', 'magenta']);
  });
});
