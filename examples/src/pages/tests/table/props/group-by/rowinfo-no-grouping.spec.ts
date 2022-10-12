import { test, expect } from '@testing';

const DATASOURCE_COUNT = 4;
const ARRAY_WITH_UNDEFINED = [...Array(DATASOURCE_COUNT)];
export default test.describe.parallel('RowInfo ungrouped', () => {
  test('rowInfo.groupKeys be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const groupKeysForAllRows = await page.evaluate(() => {
      return (window as any).dataArray.map((rowInfo: any) => rowInfo.groupKeys);
    });

    expect(groupKeysForAllRows).toEqual(ARRAY_WITH_UNDEFINED);
  });

  test('rowInfo.groupBy be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const groupByForAllRows = await page.evaluate(() => {
      return (window as any).dataArray.map((rowInfo: any) => rowInfo.groupBy);
    });

    expect(groupByForAllRows).toEqual(ARRAY_WITH_UNDEFINED);
  });

  test('rowInfo.groupCount be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const groupCountForAllRows = await page.evaluate(() => {
      return (window as any).dataArray.map(
        (rowInfo: any) => rowInfo.groupCount,
      );
    });

    expect(groupCountForAllRows).toEqual(ARRAY_WITH_UNDEFINED);
  });

  test('rowInfo.value be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const values = await page.evaluate(() => {
      return (window as any).dataArray.map(
        (rowInfo: any) => rowInfo.value || rowInfo.data.firstName,
      );
    });

    expect(values).toEqual(['Giuseppe', 'Marco', 'Luca', 'Bob']);
  });

  test('rowInfo.parents be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const parents = await page.evaluate(() => {
      return (window as any).dataArray.map((rowInfo: any) => rowInfo.parents);
    });

    expect(parents).toEqual(ARRAY_WITH_UNDEFINED);
  });
  test('rowInfo.dataSourceHasGrouping be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const dataSourceHasGrouping = await page.evaluate(() => {
      return (window as any).dataArray.map(
        (rowInfo: any) => rowInfo.dataSourceHasGrouping,
      );
    });

    expect(dataSourceHasGrouping).toEqual(
      ARRAY_WITH_UNDEFINED.map((_) => false),
    );
  });

  test('rowInfo.indexInParentGroups be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const indexInParentGroupsForAllRows = await page.evaluate(() => {
      return (window as any).dataArray.map(
        (rowInfo: any) => rowInfo.indexInParentGroups,
      );
    });

    expect(indexInParentGroupsForAllRows).toEqual(ARRAY_WITH_UNDEFINED);
  });
});
