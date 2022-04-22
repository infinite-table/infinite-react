import { InfiniteTableImperativeApi } from '@src/components/InfiniteTable/types';
import { test, expect } from '@testing';

import {
  getHeaderColumnIds,
  getHeaderColumnCells,
} from '../../../../testUtils';

export default test.describe.parallel('Column visibility uncontrolled', () => {
  test('should display specified cols correctly', async ({ page }) => {
    await page.waitForInfinite();

    let colIds = await getHeaderColumnIds({ page });

    expect(colIds).toEqual(['model', 'price']);

    // only id will be hidden, the rest will show
    await page.click('button');
    await page.waitForTimeout(30);

    colIds = await getHeaderColumnIds({ page });

    expect(colIds).toEqual(['make', 'model', 'price', 'year']);

    expect(
      await page.evaluate(() => {
        const fnCalls = (window as any).calls;

        return fnCalls[fnCalls.length - 1];
      }),
    ).toEqual({ id: false });
  });

  test('should display all cols correctly when clearing the visibility map', async ({
    page,
  }) => {
    await page.waitForInfinite();
    let colIds = await getHeaderColumnIds({ page });

    expect(colIds).toEqual(['model', 'price']);

    await page.waitForTimeout(30);
    await page.evaluate(() => {
      (
        (window as any).api as InfiniteTableImperativeApi<any>
      ).setColumnVisibility({});
    });

    await page.waitForTimeout(20);
    colIds = await getHeaderColumnIds({ page });

    expect(colIds).toEqual(['id', 'make', 'model', 'price', 'year']);

    const cells = await getHeaderColumnCells({ page });

    const transforms = await Promise.all(
      cells.map(async (cell) =>
        cell.evaluate((node) =>
          parseInt(node.style.transform.split('translate3d(')[1]),
        ),
      ),
    );

    expect(transforms).toEqual([0, 100, 200, 300, 400]);
  });
});
