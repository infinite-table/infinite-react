import { InfiniteTableImperativeApi } from '@src/components/InfiniteTable/types';
import { getHeaderColumnIds } from '../../../../testUtils';
import { test, expect } from '@playwright/test';

export default test.describe.parallel(
  'Column visibility controlled will never change',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `tests/table/props/column-visibility/controlled-with-value/change`,
      );
    });

    test('should change column visibility', async ({ page }) => {
      await page.waitForTimeout(20);
      let colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual(['id', 'model', 'price']);

      await page.evaluate(() => {
        (
          (window as any).api as InfiniteTableImperativeApi<any>
        ).setColumnVisibility({ make: false, id: false });
      });

      await page.waitForTimeout(20);
      colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual(['model', 'price', 'year']);

      await page.evaluate(() => {
        (
          (window as any).api as InfiniteTableImperativeApi<any>
        ).setColumnVisibility({ id: false, year: false });
      });

      await page.waitForTimeout(20);
      colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual(['make', 'model', 'price']);

      expect(await page.evaluate(() => (window as any).calls)).toEqual([
        { make: false, id: false },
        { id: false, year: false },
      ]);
    });
  },
);
