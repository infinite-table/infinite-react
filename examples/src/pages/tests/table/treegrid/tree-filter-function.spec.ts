import { test, expect } from '@testing';

export default test.describe('Tree filtering', () => {
  test('works as expected', async ({ page, rowModel }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toEqual(10);

    await page.fill('input[name="filter"]', 'r');

    expect(await rowModel.getRenderedRowCount()).toEqual(5);

    await page.fill('input[name="filter"]', 'ppt');

    expect(await rowModel.getRenderedRowCount()).toEqual(2);
  });
});
