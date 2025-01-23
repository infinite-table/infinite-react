import { test, expect } from '@testing';

export default test.describe('Tree filtering - allow non-leaf nodes to match', () => {
  test('works as expected', async ({ page, rowModel }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toEqual(10);

    await page.fill('input[name="filter"]', 'ict');

    expect(await rowModel.getRenderedRowCount()).toEqual(4);
  });
});
