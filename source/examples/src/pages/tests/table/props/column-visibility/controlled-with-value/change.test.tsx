import { InfiniteTableImperativeApi } from '@infinite-table/infinite-react';
import { getHeaderColumnIds } from '../../../../testUtils';

export default describe('Column visibility controlled will never change', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/column-visibility/controlled-with-value/change`,
    );
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should change column visibility', async () => {
    await page.waitForTimeout(20);
    let colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['id', 'model', 'price']);

    await page.evaluate(() => {
      (
        (window as any).api as InfiniteTableImperativeApi<any>
      ).setColumnVisibility({ make: false, id: false });
    });

    await page.waitForTimeout(20);
    colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['model', 'price', 'year']);

    await page.evaluate(() => {
      (
        (window as any).api as InfiniteTableImperativeApi<any>
      ).setColumnVisibility({ id: false, year: false });
    });

    await page.waitForTimeout(20);
    colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['make', 'model', 'price']);

    expect(await page.evaluate(() => (window as any).calls)).toEqual([
      { make: false, id: false },
      { id: false, year: false },
    ]);
  });
});
