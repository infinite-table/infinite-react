import { InfiniteTableApi } from '@src/components/InfiniteTable/types';
import { test, expect } from '@testing';

export default test.describe.parallel(
  'Column order controlled will never change',
  () => {
    test('should change column order', async ({ page, columnModel }) => {
      await page.waitForInfinite();
      let colIds = await columnModel.getVisibleColumnIds();

      expect(colIds).toEqual(['id', 'model', 'price']);

      await page.evaluate(() => {
        ((window as any).api as InfiniteTableApi<any>).setColumnOrder([
          'make',
          'model',
        ]);
      });

      await page.waitForTimeout(20);
      colIds = await columnModel.getVisibleColumnIds();

      expect(['make', 'model']).toEqual(colIds);

      await page.evaluate(() => {
        ((window as any).api as InfiniteTableApi<any>).setColumnOrder([
          'id',
          'rating',
        ]);
      });

      await page.waitForTimeout(20);
      colIds = await columnModel.getVisibleColumnIds();

      expect(colIds).toEqual(['id', 'rating']);

      // expect onColumnOrderChange to have been called correctly
      expect(await page.evaluate(() => (window as any).calls)).toEqual([
        ['make', 'model'],
        ['id', 'rating'],
      ]);
    });
  },
);
