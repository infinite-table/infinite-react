import { test, expect, Page } from '@testing';

async function getDataSourceCalls(page: Page) {
  return page.evaluate(() => (window as any).dataSourceCalls);
}

export default test.describe.parallel('DataSource data function', () => {
  test('should not be called again when resorting with sortMode=local', async ({
    page,
    headerModel,
  }) => {
    await page.waitForInfinite();

    const initialCalls = await getDataSourceCalls(page);

    await headerModel.clickToSortColumn('age');
    expect(await getDataSourceCalls(page)).toEqual(initialCalls);

    await headerModel.clickToSortColumn('age');
    expect(await getDataSourceCalls(page)).toEqual(initialCalls);

    await page.click('button');
    expect(await getDataSourceCalls(page)).toEqual(initialCalls + 1);
  });
});
