import { InfiniteTableApi } from '@src/components/InfiniteTable/types';
import { test, expect } from '@testing';

import { getHeaderColumnIds } from '../../../../testUtils';

export default test.describe.parallel(
  'Column order controlled will never change',
  () => {
    test('should not change column order', async ({ page }) => {
      await page.waitForInfinite();
      let colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual(['id', 'model', 'price']);

      await page.evaluate(() => {
        ((window as any).api as InfiniteTableApi<any>).setColumnOrder([
          'make',
          'model',
        ]);
      });

      colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual(['id', 'model', 'price']);

      await page.evaluate(() => {
        ((window as any).api as InfiniteTableApi<any>).setColumnOrder([
          'id',
          'rating',
        ]);
      });

      colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual(['id', 'model', 'price']);

      expect(await page.evaluate(() => (window as any).calls)).toEqual([
        ['make', 'model'],
        ['id', 'rating'],
      ]);
    });
  },
);
