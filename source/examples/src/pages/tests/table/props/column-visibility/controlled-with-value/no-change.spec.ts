import { InfiniteTableApi } from '@src/components/InfiniteTable/types';
import { test, expect } from '@testing';

import { getHeaderColumnIds } from '../../../../testUtils';
import { columns } from '../columns';

const cols = Array.from(columns.keys()).filter((x) => x != 'year');

export default test.describe.parallel(
  'Column visibility controlled will never change',
  () => {
    test.skip('should not change column visibility', async ({ page }) => {
      await page.waitForTimeout(10);
      let colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual(cols);

      await page.evaluate(() => {
        ((window as any).api as InfiniteTableApi<any>).setColumnVisibility({
          make: false,
          model: false,
        });
      });

      colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual(cols);

      await page.evaluate(() => {
        ((window as any).api as InfiniteTableApi<any>).setColumnVisibility({
          year: false,
          id: false,
        });
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
