import { TableImperativeApi } from '@src/components/Table';
import { getHeaderColumnIds } from '../../../../../../utils';

export default describe('Column order controlled will never change', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/column-order/controlled-with-value/no-change`,
    );
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should not change column order', async () => {
    let colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['id', 'model', 'price']);

    await page.evaluate(() => {
      ((window as any).api as TableImperativeApi<any>).setColumnOrder([
        'make',
        'model',
      ]);
    });

    colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['id', 'model', 'price']);

    await page.evaluate(() => {
      ((window as any).api as TableImperativeApi<any>).setColumnOrder([
        'id',
        'rating',
      ]);
    });

    colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['id', 'model', 'price']);

    expect(await page.evaluate(() => (window as any).calls)).toEqual([
      ['make', 'model'],
      ['id', 'rating'],
    ]);
  });
});
