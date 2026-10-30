import { test, expect } from '@testing';

export default test.describe
  .parallel('Server side sorting, local filtering by default', () => {
  test('sorting calls data() again, filtering does not', async ({
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

    // shouldReloadData only opts sorting in, so filtering stays local
    await headerModel.filterColumn(cityCol, 'San');
    await page.waitForTimeout(200);

    expect(await getCount()).toBe(initialCount + 1);
  });
});
