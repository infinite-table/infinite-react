import { InfiniteTableImperativeApi } from '@infinite-table/infinite-react';
import { getHeaderColumnIds } from '../../../../testUtils';

export default describe('Column order controlled will never change', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/column-order/controlled-with-value/change`,
    );
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should change column order', async () => {
    await page.waitForTimeout(50);
    let colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['id', 'model', 'price']);

    await page.evaluate(() => {
      ((window as any).api as InfiniteTableImperativeApi<any>).setColumnOrder([
        'make',
        'model',
      ]);
    });

    await page.waitForTimeout(20);
    colIds = await getHeaderColumnIds();

    expect(['make', 'model']).toEqual(colIds);

    await page.evaluate(() => {
      ((window as any).api as InfiniteTableImperativeApi<any>).setColumnOrder([
        'id',
        'rating',
      ]);
    });

    await page.waitForTimeout(20);
    colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['id', 'rating']);

    // expect onColumnOrderChange to have been called correctly
    expect(await page.evaluate(() => (window as any).calls)).toEqual([
      ['make', 'model'],
      ['id', 'rating'],
    ]);
  });
});
