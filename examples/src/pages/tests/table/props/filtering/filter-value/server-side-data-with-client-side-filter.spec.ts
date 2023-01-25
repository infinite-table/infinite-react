import { test, expect } from '@testing';

export default test.describe.parallel(
  'Server side sorting with client-side filtering',
  () => {
    test('Correctly avoids data() calls when filtering', async ({
      page,
      headerModel,
    }) => {
      await page.waitForInfinite();

      async function getCount() {
        return await page.evaluate(() => {
          return (window as any).dataCalls;
        });
      }

      let initialCount = await getCount();
      expect(initialCount).toBeGreaterThan(0);

      const cityCol = { colId: 'city' };
      await headerModel.clickToSortColumn(cityCol);

      await page.waitForTimeout(20);

      expect(await getCount()).toBe(initialCount + 1);

      // filtering, since it's local, should not trigger a data call
      await headerModel.filterColumn(cityCol, 'San');
      await page.waitForTimeout(20);

      expect(await getCount()).toBe(initialCount + 1);
    });
  },
);
