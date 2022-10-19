import { InfiniteTableApi } from '@src/components/InfiniteTable/types';
import { test, expect } from '@testing';

import { columns } from '../columns';

export default test.describe.parallel('Column order = true', () => {
  test('should work', async ({ page, columnModel }) => {
    await page.waitForInfinite();
    let colIds = await columnModel.getVisibleColumnIds();

    expect(colIds).toEqual(['id', 'model', 'price']);

    await page.evaluate(() => {
      ((window as any).api as InfiniteTableApi<any>).setColumnOrder(true);
    });

    await page.waitForTimeout(30);

    colIds = await columnModel.getVisibleColumnIds();

    expect(colIds).toEqual(Object.keys(columns));
  });
});
