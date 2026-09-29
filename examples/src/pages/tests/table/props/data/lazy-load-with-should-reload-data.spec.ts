import { getFnCalls } from '@examples/pages/tests/testUtils/getFnCalls';

import { test, expect } from '@testing';

const TIMEOUT = 300;

export default test.describe.parallel('Lazy Load with shouldReloadData', () => {
  test('a sort change loads the first batch only once', async ({
    page,
    tableModel,
  }) => {
    await page.waitForInfinite();
    await page.waitForTimeout(TIMEOUT);

    let calls = await getFnCalls('dataSource', { page });
    expect(calls.length).toEqual(1);

    const idCol = tableModel.withColumn('id');

    await idCol.clickToSort();
    await page.waitForTimeout(TIMEOUT);

    calls = await getFnCalls('dataSource', { page });
    expect(calls.length).toEqual(2);
    expect(calls[1].args[0].lazyLoadStartIndex).toEqual(0);
    expect(calls[1].args[0].sortInfo).toMatchObject({ dir: 1, field: 'id' });

    await idCol.clickToSort();
    await page.waitForTimeout(TIMEOUT);

    calls = await getFnCalls('dataSource', { page });
    expect(calls.length).toEqual(3);
    expect(calls[2].args[0].sortInfo).toMatchObject({ dir: -1, field: 'id' });
  });
});
