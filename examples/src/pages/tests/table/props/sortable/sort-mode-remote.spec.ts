import { test, expect, Page } from '@testing';

async function getDataSourceCalls(page: Page) {
  return page.evaluate(() => (window as any).dataSourceCalls);
}

export default test.describe.parallel('DataSource data function', () => {
  test('should be called again when resorting with sortMode=remote', async ({
    page,
    headerModel,
  }) => {
    await page.waitForInfinite();

    const initialCalls = await getDataSourceCalls(page);

    await headerModel.clickToSortColumn('age');
    expect(await getDataSourceCalls(page)).toEqual(initialCalls + 1);

    await headerModel.clickToSortColumn('age');
    expect(await getDataSourceCalls(page)).toEqual(initialCalls + 2);
  });
});
