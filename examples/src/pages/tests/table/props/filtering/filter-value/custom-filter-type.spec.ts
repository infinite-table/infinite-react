import { test, expect } from '@testing';

export default test.describe.parallel('Custom filter type', () => {
  test('works correctly', async ({ page, headerModel, rowModel }) => {
    await page.waitForInfinite();

    await headerModel
      .getHeaderCellLocator({ colId: 'country' })
      .locator('input')
      .type('United States', { delay: 50 });

    const values = await rowModel.getTextForColumnCells({ colId: 'country' });

    expect(values).toEqual(['usa', 'usa']);
  });
});
