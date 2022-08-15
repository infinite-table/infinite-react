import { InfiniteTableApi } from '@src/components/InfiniteTable/types';
import { test, expect } from '@testing';

import { getHeaderColumnIds } from '../../../../testUtils';
import { columns } from '../columns';

export default test.describe.parallel('Column order = true', () => {
  test('should work', async ({ page }) => {
    await page.waitForInfinite();
    let colIds = await getHeaderColumnIds({ page });

    expect(colIds).toEqual(['id', 'model', 'price']);

    await page.evaluate(() => {
      ((window as any).api as InfiniteTableApi<any>).setColumnOrder(true);
    });

    colIds = await getHeaderColumnIds({ page });

    expect(colIds).toEqual(Object.keys(columns));
  });
});
