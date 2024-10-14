import { test, expect } from '@testing';

export default test.describe.parallel('DataSourceApi', () => {
  test('removeDataArrayByPrimaryKeys - works to remove more rows in one go', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    let rowCount = await rowModel.getRenderedRowCount();

    expect(rowCount).toBe(4);

    await page.click('button:first-of-type');

    await page.evaluate(() => new Promise(requestAnimationFrame));

    rowCount = await rowModel.getRenderedRowCount();

    expect(rowCount).toBe(0);
  });
  test('removeDataArray - works to remove more rows in one go', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    let rowCount = await rowModel.getRenderedRowCount();

    expect(rowCount).toBe(4);

    await page.click('button:last-of-type');

    await page.evaluate(() => new Promise(requestAnimationFrame));

    rowCount = await rowModel.getRenderedRowCount();

    expect(rowCount).toBe(0);
  });
});
