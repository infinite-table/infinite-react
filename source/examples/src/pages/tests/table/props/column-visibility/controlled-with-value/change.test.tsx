import { TableImperativeApi } from '@src/components/Table';
import { getHeaderColumnIds } from '../../../../../../utils';

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
      ((window as any).api as TableImperativeApi<any>).setColumnVisibility(
        new Map([
          ['make', false],
          ['id', false],
        ]),
      );
    });

    await page.waitForTimeout(20);
    colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['model', 'price', 'year']);

    await page.evaluate(() => {
      ((window as any).api as TableImperativeApi<any>).setColumnVisibility(
        new Map([
          ['id', false],
          ['year', false],
        ]),
      );
    });

    await page.waitForTimeout(20);
    colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['make', 'model', 'price']);

    expect(await page.evaluate(() => (window as any).calls)).toEqual([
      Array.from(
        new Map([
          ['make', false],
          ['id', false],
        ]).entries(),
      ),
      Array.from(
        new Map([
          ['id', false],
          ['year', false],
        ]).entries(),
      ),
    ]);
  });
});
