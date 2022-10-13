import { expect, test } from '@testing';

export default test.describe.parallel('column.sortType', () => {
  test('should work properly', async ({ page, headerModel, rowModel }) => {
    await page.waitForInfinite();

    await headerModel.clickColumnHeader({ colId: 'sales' });

    const values = await rowModel.getTextForColumnCells({ colId: 'sales' });
    const sorted = values.map((x: any) => x * 1);

    sorted.sort((a, b) => a - b);

    expect(values).toEqual(sorted.map((x) => x + ''));
  });
});
