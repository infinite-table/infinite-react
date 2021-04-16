import { TableImperativeApi } from '@src/components/Table';
import { getHeaderColumnIds } from '../../../../../../utils';

export default describe('Column order uncontrolled', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/column-order/uncontrolled-with-value`,
    );
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should display specified cols correctly', async () => {
    let colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['id', 'model', 'price', 'year']);

    await page.evaluate(() => {
      ((window as any).api as TableImperativeApi<any>).setColumnOrder([
        'make',
        'model',
      ]);
    });

    colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['make', 'model']);

    await page.evaluate(() => {
      ((window as any).api as TableImperativeApi<any>).setColumnOrder([
        'id',
        'rating',
      ]);
    });

    colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['id', 'rating']);

    expect(await page.evaluate(() => (window as any).calls)).toEqual([
      ['make', 'model'],
      ['id', 'rating'],
    ]);
  });
});
