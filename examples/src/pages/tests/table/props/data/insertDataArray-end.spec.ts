import { test, expect } from '@testing';

export default test.describe.parallel('Mutations simple test', () => {
  test('api.insertDataArray works correctly', async ({ page, rowModel }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toBe(3);

    await page.click('button');

    expect(
      await rowModel.getTextForCell({ rowIndex: 3, colId: 'firstName' }),
    ).toBe('Mark');
    expect(
      await rowModel.getTextForCell({ rowIndex: 4, colId: 'firstName' }),
    ).toBe('After Mark');
    expect(await rowModel.getRenderedRowCount()).toBe(5);
  });
});
