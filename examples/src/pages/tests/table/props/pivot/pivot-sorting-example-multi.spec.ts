import { test, expect } from '@testing';

const STARS_TRUE_ASC = ['99524', '151156', '599585'];
const LANGUAGES_ASC = ['HTML', 'TypeScript', 'JavaScript'];

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

async function getTopLevelStarsTrueValues(apiModel: {
  evaluateDataSource: (fn: (api: any) => any) => Promise<any>;
}) {
  return apiModel.evaluateDataSource((api) => {
    return api
      .getRowInfoArray()
      .filter((row: any) => row.isGroupRow && row.groupNesting === 1)
      .map(
        (row: any) =>
          row.pivotValuesMap?.get([true])?.reducerResults?.stargazers_count,
      )
      .map(String);
  });
}

export default test.describe.parallel('Pivot column sort', () => {
  test('clicking stargazers_count:true sorts groups by that value, then reverses', async ({
    page,
    tableModel,
    headerModel,
    apiModel,
  }) => {
    await page.waitForInfinite();

    const col = tableModel.withColumn('stargazers_count:true');
    const header = headerModel.getHeaderCellLocator('stargazers_count:true');

    await col.clickToSort();

    expect(await header.getAttribute('data-sort')).toBe('asc');
    expect(await getTopLevelGroupValues(apiModel)).toEqual(LANGUAGES_ASC);
    expect(await getTopLevelStarsTrueValues(apiModel)).toEqual(STARS_TRUE_ASC);

    await col.clickToSort();

    expect(await header.getAttribute('data-sort')).toBe('desc');
    expect(await getTopLevelGroupValues(apiModel)).toEqual(
      [...LANGUAGES_ASC].reverse(),
    );
    expect(await getTopLevelStarsTrueValues(apiModel)).toEqual(
      [...STARS_TRUE_ASC].reverse(),
    );
  });
});
