import { test, expect } from '@testing';

export default test.describe.parallel('api.replaceAllData', () => {
  test('works', async ({ page, apiModel, rowModel }) => {
    await page.waitForInfinite();

    let rowCount = await rowModel.getRenderedRowCount();

    expect(rowCount).toBe(3);

    await page.click('button');
    await page.evaluate(() => new Promise(requestAnimationFrame));

    rowCount = await rowModel.getRenderedRowCount();

    expect(rowCount).toBe(1);

    await apiModel.evaluateDataSource((api) => {
      return api.replaceAllData([
        { id: 10, name: 'Porsche', price: 60000 },
        {
          id: 11,
          name: 'Mclaren',
          price: 200000,
        },
      ]);
    });

    await page.evaluate(() => new Promise(requestAnimationFrame));
    rowCount = await rowModel.getRenderedRowCount();
    expect(rowCount).toBe(2);

    await apiModel.evaluateDataSource((api) => {
      api.addData([{ id: 12, name: 'Porsche', price: 60000 }]);
      api.addData([{ id: 13, name: 'Porsche', price: 60000 }]);
      api.addData([{ id: 14, name: 'Porsche', price: 60000 }]);
      api.clearAllData();

      api.addData([{ id: 15, name: 'Porsche', price: 60000 }]);
    });

    await page.evaluate(() => new Promise(requestAnimationFrame));
    rowCount = await rowModel.getRenderedRowCount();
    expect(rowCount).toBe(1);
  });
});
