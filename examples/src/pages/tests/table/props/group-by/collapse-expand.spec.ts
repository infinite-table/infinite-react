import { test, expect } from '@testing';

export default test.describe.parallel('Table', () => {
  test('cell content is there', async ({ page, rowModel }) => {
    await page.waitForInfinite();

    let count = await rowModel.getRenderedRowCount();

    expect(count).toEqual(12);

    const expanderIcon = await page.$('.InfiniteIcon-expander--expanded');

    // collapse Cuba
    await expanderIcon!.click();

    count = await rowModel.getRenderedRowCount();

    expect(count).toEqual(9);

    // expand Cuba
    await expanderIcon!.click();

    count = await rowModel.getRenderedRowCount();

    expect(count).toEqual(12);
  });
});
