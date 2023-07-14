import { getFnCalls } from '@examples/pages/tests/testUtils/getFnCalls';
import { test, expect, Page } from '@testing';

async function getCalls({ page }: { page: Page }) {
  return await getFnCalls('onSortInfoChange', { page });
}

export default test.describe.parallel('Group column sorting', () => {
  test('gives correct sort info', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const col = tableModel.withColumn('group-test');

    await col.clickToSort();

    let calls = await getCalls({ page });
    expect(calls[0].args).toEqual([
      {
        dir: 1,
        field: ['team', 'age'],
        id: 'group-test',
        type: ['string', 'number'],
      },
    ]);

    await col.clickToSort();

    calls = await getCalls({ page });
    expect(calls[1].args).toEqual([
      {
        dir: -1,
        field: ['team', 'age'],
        id: 'group-test',
        type: ['string', 'number'],
      },
    ]);

    await col.clickToSort();

    calls = await getCalls({ page });
    expect(calls[2].args).toEqual([null]);
  });
});
