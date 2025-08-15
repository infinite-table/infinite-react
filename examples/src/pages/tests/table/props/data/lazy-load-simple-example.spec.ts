import { getFnCalls } from '@examples/pages/tests/testUtils/getFnCalls';
import { test, expect, Page } from '@testing';

async function getCalls({ page }: { page: Page }) {
  return await getFnCalls('dataSource', { page });
}

async function getCallCount({ page }: { page: Page }) {
  return (await getFnCalls('dataSource', { page })).length;
}

const TIMEOUT = 50;

export default test.describe.parallel('Lazy Load Data', () => {
  test('should work', async ({ page, tableModel }) => {
    await page.waitForInfinite();
    let CALL_COUNT = 1;

    expect(await page.getGlobalValue('state.dataArray.length')).toBe(1000);
    expect(await page.getGlobalValue('state.dataArray.49.data')).toBeDefined();
    expect(
      await page.getGlobalValue('state.dataArray.50.data'),
    ).toBeUndefined();

    expect(await getCallCount({ page })).toEqual(CALL_COUNT);

    // scroll to row 50
    await page.evaluate(() => {
      (window as any).api.scrollRowIntoView(50, {
        scrollAdjustPosition: 'start',
      });
    });

    await page.waitForTimeout(TIMEOUT);

    CALL_COUNT = 2;
    expect(await getCallCount({ page })).toEqual(CALL_COUNT);
    expect(await page.getGlobalValue('state.dataArray.50.data')).toBeDefined();

    const idCol = tableModel.withColumn('id');

    // sort asc
    await idCol.clickToSort();
    await page.waitForTimeout(TIMEOUT);

    CALL_COUNT = 3;
    let dataSourceCalls = await getCalls({ page });
    expect(await getCallCount({ page })).toEqual(CALL_COUNT);

    expect(dataSourceCalls[CALL_COUNT - 1].args[0].sortInfo).toEqual({
      dir: 1,
      field: 'id',
      id: 'id',
      type: 'string',
    });
    expect(dataSourceCalls[CALL_COUNT - 1].args[0].lazyLoadStartIndex).toEqual(
      50,
    );

    // sort desc
    await idCol.clickToSort();
    await page.waitForTimeout(TIMEOUT);

    CALL_COUNT = 4;
    dataSourceCalls = await getCalls({ page });
    expect(await getCallCount({ page })).toEqual(CALL_COUNT);
    expect(dataSourceCalls[CALL_COUNT - 1].args[0].lazyLoadStartIndex).toEqual(
      50,
    );
    expect(dataSourceCalls[CALL_COUNT - 1].args[0].sortInfo).toEqual({
      dir: -1,
      field: 'id',
      id: 'id',
      type: 'string',
    });

    //#make-sure-old-lazy-data-is-cleared
    expect(await page.getGlobalValue('state.dataArray.0.data')).toBeUndefined();
    expect((await page.getGlobalValue('state.dataArray.50.data')).id).toEqual(
      949,
    );

    // remove sort
    await idCol.clickToSort();
    await page.waitForTimeout(TIMEOUT);

    CALL_COUNT = 5;
    dataSourceCalls = await getCalls({ page });
    expect(await getCallCount({ page })).toEqual(CALL_COUNT);

    expect(dataSourceCalls[CALL_COUNT - 1].args[0].lazyLoadStartIndex).toEqual(
      50,
    );
    expect(dataSourceCalls[CALL_COUNT - 1].args[0].sortInfo).toEqual(null);

    // scroll to row 0
    // which should trigger a reload of the first batch of data
    // as it's not in the cache
    await page.evaluate(() => {
      (window as any).api.scrollRowIntoView(0, {
        scrollAdjustPosition: 'start',
      });
    });

    await page.waitForTimeout(TIMEOUT * 2);
    CALL_COUNT = 6;
    dataSourceCalls = await getCalls({ page });

    expect(await getCallCount({ page })).toEqual(CALL_COUNT);
    expect(dataSourceCalls[CALL_COUNT - 1].args[0].lazyLoadStartIndex).toEqual(
      0,
    );

    expect(await page.getGlobalValue('state.dataArray.49.data')).toBeDefined();
    expect(await page.getGlobalValue('state.dataArray.50.data')).toBeDefined();
    expect(await page.getGlobalValue('state.dataArray.99.data')).toBeDefined();
    expect(
      await page.getGlobalValue('state.dataArray.100.data'),
    ).toBeUndefined();
  });
});
