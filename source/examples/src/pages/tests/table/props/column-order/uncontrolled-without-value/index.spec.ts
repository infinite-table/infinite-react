import { getHeaderColumnIds } from '../../../../testUtils';
import { test, expect } from '@playwright/test';

export default test.describe.parallel(
  'Column order uncontrolled without any defaultValue',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `tests/table/props/column-order/uncontrolled-without-value`,
      );
    });

    test('should display all cols', async ({ page }) => {
      await page.waitForTimeout(50);
      const colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual([
        'id',
        'make',
        'model',
        'price',
        'year',
        'rating',
      ]);
    });

    test('should remove column when a new key is removed from the columns map', async ({
      page,
    }) => {
      await page.waitForTimeout(50);
      let colIds = await getHeaderColumnIds({ page });

      expect(colIds).toEqual([
        'id',
        'make',
        'model',
        'price',
        'year',
        'rating',
      ]);

      await page.click('button'); // hide id and make columns

      await page.waitForTimeout(50);
      colIds = await getHeaderColumnIds({ page });

      // expect(colIds).toEqual(['id', 'make', 'model', 'price', 'year', 'rating']);
      expect(colIds).toEqual(['model', 'price', 'year', 'rating']);
    });
  },
);
