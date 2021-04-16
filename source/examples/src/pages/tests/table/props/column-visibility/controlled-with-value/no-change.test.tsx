import { TableImperativeApi } from '@src/components/Table';
import { getHeaderColumnIds } from '../../../../../../utils';
import { columns } from '../columns';

const cols = Array.from(columns.keys()).filter((x) => x != 'year');

export default describe('Column visibility controlled will never change', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/column-visibility/controlled-with-value/no-change`,
    );
  });

  beforeEach(async () => {
    await page.reload();
  });

  it('should not change column visibility', async () => {
    await page.waitForTimeout(20);
    let colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(cols);

    await page.evaluate(() => {
      ((window as any).api as TableImperativeApi<any>).setColumnVisibility(
        new Map([
          ['make', false],
          ['model', false],
        ]),
      );
    });

    colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(cols);

    await page.evaluate(() => {
      ((window as any).api as TableImperativeApi<any>).setColumnVisibility(
        new Map([
          ['year', false],
          ['id', false],
        ]),
      );
    });

    colIds = await getHeaderColumnIds();

    expect(colIds).toEqual(cols);

    expect(await page.evaluate(() => (window as any).calls)).toEqual([
      Array.from(
        new Map([
          ['make', false],
          ['model', false],
        ]).entries(),
      ),
      Array.from(
        new Map([
          ['year', false],
          ['id', false],
        ]).entries(),
      ),
    ]);
  });
});
