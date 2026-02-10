import { getFnCalls } from '@examples/pages/tests/testUtils/getFnCalls';

import { test, expect, Page } from '@testing';

async function getCalls({ page }: { page: Page }) {
  return await getFnCalls('dataSource', { page });
}

async function getCallCount({ page }: { page: Page }) {
  return (await getFnCalls('dataSource', { page })).length;
}

const TIMEOUT = 150;

export default test.describe.parallel('Lazy Load Grouped Data', () => {
  test('should work when we expand a group and sort by it', async ({
    page,
    tableModel,
  }) => {
    await page.waitForInfinite();
    let CALL_COUNT = 1;
    let dataSourceCalls = await getCalls({ page });
    let arg = dataSourceCalls[CALL_COUNT - 1].args[0];

    expect(await page.getGlobalValue('dataArrayLength')).toBe(20);
    expect(await getCallCount({ page })).toEqual(CALL_COUNT);

    expect({
      groupBy: arg.groupBy,
      groupKeys: arg.groupKeys,
      sortInfo: arg.sortInfo,
    }).toEqual({
      groupKeys: [],
      sortInfo: null,
      groupBy: [{ field: 'country' }],
    });

    const cell = tableModel.withCell({
      rowIndex: 0,
      colIndex: 0,
    });

    await cell.clickDetailIcon();
    await page.waitForTimeout(TIMEOUT);

    CALL_COUNT = 2;
    dataSourceCalls = await getCalls({ page });
    arg = dataSourceCalls[CALL_COUNT - 1].args[0];
    expect(await getCallCount({ page })).toEqual(CALL_COUNT);

    expect({
      groupBy: arg.groupBy,
      groupKeys: arg.groupKeys,
      sortInfo: arg.sortInfo,
    }).toEqual({
      sortInfo: null,
      groupKeys: ['Argentina'],
      groupBy: [{ field: 'country' }],
    });

    const col = cell.withColumn();

    await col.clickToSort();

    await page.waitForTimeout(TIMEOUT);

    CALL_COUNT = 4;
    dataSourceCalls = await getCalls({ page });
    const prevArg = dataSourceCalls[CALL_COUNT - 2].args[0];
    arg = dataSourceCalls[CALL_COUNT - 1].args[0];
    expect(await getCallCount({ page })).toEqual(CALL_COUNT);

    expect({
      groupBy: prevArg.groupBy,
      groupKeys: prevArg.groupKeys,
      sortInfo: prevArg.sortInfo,
    }).toEqual({
      sortInfo: {
        dir: 1,
        field: ['country'],
        id: 'group-by-country',
        type: ['string'],
      },
      groupKeys: [],
      groupBy: [{ field: 'country' }],
    });
    expect({
      groupBy: arg.groupBy,
      groupKeys: arg.groupKeys,
      sortInfo: arg.sortInfo,
    }).toEqual({
      sortInfo: {
        dir: 1,
        field: ['country'],
        id: 'group-by-country',
        type: ['string'],
      },
      groupKeys: ['Argentina'],
      groupBy: [{ field: 'country' }],
    });
  });

  test('should work in scenario when no group is expanded', async ({
    page,
    tableModel,
  }) => {
    await page.waitForInfinite();
    let CALL_COUNT = 1;
    let dataSourceCalls = await getCalls({ page });

    expect(await page.getGlobalValue('state.dataArray.length')).toBe(20);
    expect(await getCallCount({ page })).toEqual(CALL_COUNT);

    let arg = dataSourceCalls[CALL_COUNT - 1].args[0];

    expect({
      groupBy: arg.groupBy,
      groupKeys: arg.groupKeys,
      sortInfo: arg.sortInfo,
    }).toEqual({
      groupKeys: [],
      sortInfo: null,
      groupBy: [{ field: 'country' }],
    });

    const cell = tableModel.withCell({
      rowIndex: 0,
      colIndex: 0,
    });

    const col = cell.withColumn();

    await col.clickToSort();

    CALL_COUNT = 2;
    dataSourceCalls = await getCalls({ page });
    arg = dataSourceCalls[CALL_COUNT - 1].args[0];

    expect(await getCallCount({ page })).toEqual(CALL_COUNT);

    expect({
      groupBy: arg.groupBy,
      groupKeys: arg.groupKeys,
      sortInfo: arg.sortInfo,
    }).toEqual({
      sortInfo: {
        dir: 1,
        field: ['country'],
        id: 'group-by-country',
        type: ['string'],
      },
      groupKeys: [],
      groupBy: [{ field: 'country' }],
    });
    expect(await cell.getValue()).toBe('Argentina');

    await col.clickToSort();

    await page.waitForTimeout(TIMEOUT);

    CALL_COUNT = 3;
    dataSourceCalls = await getCalls({ page });
    arg = dataSourceCalls[CALL_COUNT - 1].args[0];

    expect(await getCallCount({ page })).toEqual(CALL_COUNT);

    expect({
      groupBy: arg.groupBy,
      groupKeys: arg.groupKeys,
      sortInfo: arg.sortInfo,
    }).toEqual({
      sortInfo: {
        dir: -1,
        field: ['country'],
        id: 'group-by-country',
        type: ['string'],
      },
      groupKeys: [],
      groupBy: [{ field: 'country' }],
    });

    expect(await cell.getValue()).toBe('United States');
  });
});
