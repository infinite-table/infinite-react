import { test, expect } from '@testing';

export default test.describe
  .parallel('Server side sorting with default filter mode', () => {
  test('Correctly executes data() calls when filtering', async ({
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

    // filtering, since it's remote, should trigger a data call
    await headerModel.filterColumn(cityCol, 'San');
    await page.waitForTimeout(200);

    expect(await getCount()).toBe(initialCount + 2);
  });
});
