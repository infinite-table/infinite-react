import { InfiniteTableRowInfo } from '@src/utils/groupAndPivot';
import { test, expect } from '@testing';

export default test.describe('Tree Grid with single row selection', () => {
  test('should work correctly', async ({ page, apiModel }) => {
    await page.waitForInfinite();

    const rowInfos: InfiniteTableRowInfo<any>[] =
      await apiModel.evaluateDataSource((api) => {
        return api.getRowInfoArray();
      });

    expect(
      rowInfos.map((x: InfiniteTableRowInfo<any>) => x.rowSelected),
    ).toEqual([false, true, false, false, false, false, false, false]);
  });
});
