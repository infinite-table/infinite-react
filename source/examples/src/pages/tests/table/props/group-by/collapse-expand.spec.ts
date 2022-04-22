import { test, expect } from '@testing';

export default test.describe.parallel('Table', () => {
  test('cell content is there', async ({ page }) => {
    await page.waitForInfinite();
    const getRowCount = async () =>
      await page.evaluate(
        () =>
          document.querySelectorAll(
            '.InfiniteColumnCell[data-row-index][data-col-index="0"]',
          ).length,
      );

    let count = await getRowCount();

    expect(count).toEqual(12);

    const expanderIcon = await page.$('.InfiniteIcon-expander--expanded');

    // collapse Cuba
    await expanderIcon!.click();

    count = await getRowCount();

    expect(count).toEqual(9);

    // expand Cuba
    await expanderIcon!.click();

    count = await getRowCount();

    expect(count).toEqual(12);
  });
});
