import { CarSale } from '@examples/datasets/CarSale';
import { getCellText } from '../../../testUtils';

import { test, expect } from '@playwright/test';

export default test.describe.parallel('Table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/props/data/basic`);
    await page.waitForSelector('[data-row-index]');
  });

  test('cell content is there', async ({ page }) => {
    const data = (await page.evaluate(
      () => (window as any).carsales,
    )) as CarSale[];

    const text = await getCellText(
      {
        rowIndex: data.length - 2,
        columnId: 'model',
      },
      { page },
    );

    expect(text).toEqual(data[data.length - 2].model);
  });
});
