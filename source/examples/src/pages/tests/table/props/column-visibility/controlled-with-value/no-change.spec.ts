import { InfiniteTableImperativeApi } from '@src/components/InfiniteTable/types';
import { getHeaderColumnIds } from '../../../../testUtils';
import { test, expect } from '@playwright/test';

import { columns } from '../columns';

const cols = Array.from(columns.keys()).filter((x) => x != 'year');

export default test.describe.parallel(
  'Column visibility controlled will never change',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `test/table/props/column-visibility/controlled-with-value/no-change`,
      );
    });

    test.skip('should not change column visibility', async ({ page }) => {
      await page.waitForTimeout(10);
      let colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual(cols);

      await page.evaluate(() => {
        (
          (window as any).api as InfiniteTableImperativeApi<any>
        ).setColumnVisibility({ make: false, model: false });
      });

      colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual(cols);

      await page.evaluate(() => {
        (
          (window as any).api as InfiniteTableImperativeApi<any>
        ).setColumnVisibility({ year: false, id: false });
      });

      colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual(cols);

      expect(await page.evaluate(() => (window as any).calls)).toEqual([
        { make: false, model: false },
        { year: false, id: false },
      ]);
    });
  },
);
