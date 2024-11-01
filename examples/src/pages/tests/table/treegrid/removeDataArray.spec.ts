import { test, expect } from '@testing';

export default test.describe.parallel('TreeDataSourceApi', () => {
  test('removeDataArrayByPrimaryKeys - works to remove more rows in one go', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    let rowCount = await rowModel.getRenderedRowCount();

    expect(rowCount).toBe(5);

    await page.click('button:text("Click to removeRowsByPrimaryKey")');

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

    expect(rowCount).toBe(5);

    await page.click('button:text("Click to removeRowsByDataRow")');

    await page.evaluate(() => new Promise(requestAnimationFrame));

    rowCount = await rowModel.getRenderedRowCount();

    expect(rowCount).toBe(0);
  });

  test('removeDataByPrimaryKey - works to remove one row', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    let rowCount = await rowModel.getRenderedRowCount();

    expect(rowCount).toBe(5);

    await page.click('button:text("Click to remove one by id")');

    await page.evaluate(() => new Promise(requestAnimationFrame));

    rowCount = await rowModel.getRenderedRowCount();

    expect(rowCount).toBe(3);
  });
});
