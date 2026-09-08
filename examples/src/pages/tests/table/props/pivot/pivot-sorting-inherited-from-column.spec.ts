import { test, expect } from '@testing';

import { data } from './pivot-sorting-example-data';

function starsForWiki(language: string, hasWiki: boolean) {
  return data
    .filter((row) => row.language === language && row.has_wiki === hasWiki)
    .reduce((sum, row) => sum + row.stargazers_count, 0);
}

const languagesByStarsTrueAsc = [
  ...new Set(data.map((row) => row.language)),
].sort((a, b) => starsForWiki(a, true) - starsForWiki(b, true));

const starsTrueAsc = languagesByStarsTrueAsc.map((language) =>
  String(starsForWiki(language, true)),
);

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

export default test.describe
  .parallel('Pivot column sortable inherited from user column', () => {
  test('pivot columns inherit sortability from the user column they inherit from', async ({
    page,
    tableModel,
    headerModel,
    apiModel,
  }) => {
    await page.waitForInfinite();

    expect(
      await apiModel.evaluate((api) =>
        api.getColumnApi('stargazers_count:true')!.isSortable(),
      ),
    ).toBe(true);
    expect(
      await apiModel.evaluate((api) =>
        api.getColumnApi('stargazers_count:false')!.isSortable(),
      ),
    ).toBe(true);
    expect(
      await apiModel.evaluate((api) =>
        api.getColumnApi('license:true')!.isSortable(),
      ),
    ).toBe(false);
    expect(
      await apiModel.evaluate((api) =>
        api.getColumnApi('license:false')!.isSortable(),
      ),
    ).toBe(false);

    const col = tableModel.withColumn('stargazers_count:true');
    const header = headerModel.getHeaderCellLocator('stargazers_count:true');
    const licenseHeader = headerModel.getHeaderCellLocator('license:true');

    await tableModel.withColumn('license:true').clickToSort();
    expect(await licenseHeader.getAttribute('data-sort')).toBe('none');

    await col.clickToSort();

    expect(await header.getAttribute('data-sort')).toBe('asc');
    expect(await getTopLevelGroupValues(apiModel)).toEqual(
      languagesByStarsTrueAsc,
    );
    expect(await getTopLevelStarsTrueValues(apiModel)).toEqual(starsTrueAsc);

    await col.clickToSort();

    expect(await header.getAttribute('data-sort')).toBe('desc');
    expect(await getTopLevelGroupValues(apiModel)).toEqual(
      [...languagesByStarsTrueAsc].reverse(),
    );
    expect(await getTopLevelStarsTrueValues(apiModel)).toEqual(
      [...starsTrueAsc].reverse(),
    );
  });
});
