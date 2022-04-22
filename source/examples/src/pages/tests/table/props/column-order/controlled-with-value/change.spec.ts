import { InfiniteTableImperativeApi } from '@src/components/InfiniteTable/types';
import { test, expect } from '@testing';

import { getHeaderColumnIds } from '../../../../testUtils';

export default test.describe.parallel(
  'Column order controlled will never change',
  () => {
    test('should change column order', async ({ page }) => {
      await page.waitForTimeout(50);
      let colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual(['id', 'model', 'price']);

      await page.evaluate(() => {
        ((window as any).api as InfiniteTableImperativeApi<any>).setColumnOrder(
          ['make', 'model'],
        );
      });

      await page.waitForTimeout(20);
      colIds = await getHeaderColumnIds({ page });

      expect(['make', 'model']).toEqual(colIds);

      await page.evaluate(() => {
        ((window as any).api as InfiniteTableImperativeApi<any>).setColumnOrder(
          ['id', 'rating'],
        );
      });

      await page.waitForTimeout(20);
      colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual(['id', 'rating']);

      // expect onColumnOrderChange to have been called correctly
      expect(await page.evaluate(() => (window as any).calls)).toEqual([
        ['make', 'model'],
        ['id', 'rating'],
      ]);
    });
  },
);
