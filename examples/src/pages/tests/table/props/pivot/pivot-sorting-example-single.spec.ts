import { test, expect } from '@testing';

const LANGUAGES_ASC = ['HTML', 'JavaScript', 'TypeScript'];
const LANGUAGES_DESC = ['TypeScript', 'JavaScript', 'HTML'];

async function getTopLevelGroupValues(apiModel: {
  evaluateDataSource: (fn: (api: any) => any) => Promise<any>;
}) {
  return apiModel.evaluateDataSource((api) => {
    return api
      .getRowInfoArray()
      .filter((row: any) => row.isGroupRow && row.groupNesting === 1)
      .map((row: any) => row.value ?? row.groupKeys?.[0]);
  });
}

export default test.describe
  .parallel('Pivot group-column sort inference', () => {
  test('sortInfo { id, dir } sorts the group column without sortType or field', async ({
    page,
    tableModel,
    headerModel,
    apiModel,
  }) => {
    await page.waitForInfinite();

    const groupCol = tableModel.withColumn('group-by');
    const header = headerModel.getHeaderCellLocator('group-by');

    expect(await header.getAttribute('data-sort')).toBe('asc');
    expect(
      await apiModel.evaluate((api) =>
        api.getColumnApi('group-by')!.isSortable(),
      ),
    ).toBe(true);
    expect(await getTopLevelGroupValues(apiModel)).toEqual(LANGUAGES_ASC);

    await groupCol.clickToSort();

    expect(await header.getAttribute('data-sort')).toBe('desc');
    expect(await getTopLevelGroupValues(apiModel)).toEqual(LANGUAGES_DESC);
  });
});
