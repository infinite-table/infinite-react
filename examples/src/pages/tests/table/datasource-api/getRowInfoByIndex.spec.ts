import { test, expect } from '@testing';

export default test.describe.parallel('DataSourceApi', () => {
  test('getRowInfoByIndex', async ({ page, apiModel }) => {
    await page.waitForInfinite();

    const rowInfo = await apiModel.evaluateDataSource((api) => {
      return api.getRowInfoByIndex(0);
    });

    expect(rowInfo).toMatchObject({
      indexInAll: 0,
      data: {
        id: 1,
      },
      dataSourceHasGrouping: false,
      isGroupRow: false,
      isTreeNode: false,
    });

    expect(
      await apiModel.evaluateDataSource((api) => {
        return api.getRowInfoArray().length;
      }),
    ).toBe(4);

    const rowInfoLast = await apiModel.evaluateDataSource((api) => {
      return api.getRowInfoByIndex(3);
    });

    expect(rowInfoLast).toMatchObject({
      indexInAll: 3,
      data: {
        id: 4,
      },
      dataSourceHasGrouping: false,
      isGroupRow: false,
      isTreeNode: false,
    });
  });
});
