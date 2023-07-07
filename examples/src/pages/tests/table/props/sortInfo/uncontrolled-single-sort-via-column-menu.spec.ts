import { getFnCalls } from '@examples/pages/tests/testUtils/getFnCalls';
import { test, expect, Page } from '@testing';

async function getCalls({ page }: { page: Page }) {
  return await getFnCalls('onSortInfoChange', { page });
}

export default test.describe.parallel('Sorting via column menu', () => {
  test('should call onSortInfoChange', async ({
    page,

    headerModel,
  }) => {
    await page.waitForInfinite();

    await headerModel.clickColumnMenuItem('itemCount', 'sort-asc');

    const calls = await getCalls({ page });
    expect(calls.length).toEqual(1);
    expect(calls[0].args[0]).toEqual({
      dir: 1,
      field: 'ItemCount',
      type: 'number',
      id: 'itemCount',
    });
  });
});
