import { InfiniteTableImperativeApi } from '@src/components/InfiniteTable/types';
import { getHeaderColumnIds } from '../../../../testUtils';
import { test, expect } from '@playwright/test';

export default test.describe.parallel('Column order uncontrolled', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/props/column-order/uncontrolled-with-value`);
  });

  test('should display specified cols correctly', async ({ page }) => {
    await page.waitForTimeout(20);
    let colIds = await getHeaderColumnIds({ page });

    expect(colIds).toEqual(['id', 'model', 'price', 'year']);

    await page.waitForTimeout(30);
    await page.evaluate(() => {
      ((window as any).api as InfiniteTableImperativeApi<any>).setColumnOrder([
        'make',
        'model',
      ]);
    });

    await page.waitForTimeout(20);
    colIds = await getHeaderColumnIds({ page });

    expect(colIds).toEqual(['make', 'model']);

    await page.evaluate(() => {
      ((window as any).api as InfiniteTableImperativeApi<any>).setColumnOrder([
        'id',
        'rating',
      ]);
    });

    await page.waitForTimeout(20);
    colIds = await getHeaderColumnIds({ page });

    expect(colIds).toEqual(['id', 'rating']);

    expect(await page.evaluate(() => (window as any).calls)).toEqual([
      ['make', 'model'],
      ['id', 'rating'],
    ]);
  });
});
