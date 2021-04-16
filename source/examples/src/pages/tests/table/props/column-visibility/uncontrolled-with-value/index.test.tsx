import { TableImperativeApi } from '@src/components/Table';
import {
  getHeaderColumnIds,
  getHeaderColumnCells,
} from '../../../../../../utils';

export default describe('Column visibility uncontrolled', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/column-visibility/uncontrolled-with-value`,
    );
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should display specified cols correctly', async () => {
    let colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['model', 'price']);

    // only id will be hidden, the rest will show
    await page.click('button');
    await page.waitForTimeout(30);

    colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['make', 'model', 'price', 'year']);

    expect(await page.evaluate(() => (window as any).calls)).toEqual([
      [['id', false]],
    ]);
  });

  it('should display all cols correctly when clearing the visibility map', async () => {
    let colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['model', 'price']);

    await page.evaluate(() => {
      ((window as any).api as TableImperativeApi<any>).setColumnVisibility(
        new Map(),
      );
    });

    await page.waitForTimeout(20);
    colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(['id', 'make', 'model', 'price', 'year']);

    const cells = await getHeaderColumnCells();

    const transforms = await Promise.all(
      cells.map(async (cell) =>
        cell.evaluate((node) =>
          parseInt((node as any).style.transform.split('translateX(')[1]),
        ),
      ),
    );

    expect(transforms).toEqual([0, 100, 200, 300, 400]);
  });
});
