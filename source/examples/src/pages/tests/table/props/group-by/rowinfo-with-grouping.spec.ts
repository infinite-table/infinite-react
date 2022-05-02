import { test, expect } from '@testing';

import { data } from './rowinfo-with-grouping-data';

const filterBy = <T>(
  propertyName: keyof T | (keyof T)[],
  propertyValue: any | any[],
  data: T[],
) => {
  return data.filter((x) => {
    if (!Array.isArray(propertyName)) {
      return x[propertyName] === propertyValue;
    }

    return propertyName.every((p, index) => x[p] === propertyValue[index]);
  });
};

export default test.describe.parallel('RowInfo grouped', () => {
  test('rowInfo.groupKeys be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const groupKeysForAllRows = await page.evaluate(() => {
      return (window as any).dataArray.map((rowInfo: any) => rowInfo.groupKeys);
    });

    expect(groupKeysForAllRows).toEqual([
      ['Italy'], // "Italy" Group
      ['Italy', 'Rome'], // "Italy Rome" Group
      ['Italy', 'Rome'], // Italy > Rome > Giuseppe
      ['Italy', 'Rome'], // Italy > Rome > Marco
      ['Italy', 'Napoli'], // "Italy Napoli" Group
      ['Italy', 'Napoli'], // Italy > Napoli > Luca
      ['USA'], // "USA" Group
      ['USA', 'LA'], // "USA LA" Group
      ['USA', 'LA'], // USA > LA > Bob
    ]);
  });

  test('rowInfo.dataSourceHasGrouping be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const dataSourceHasGroupingForAllRows = await page.evaluate(() => {
      return (window as any).dataArray.map(
        (rowInfo: any) => rowInfo.dataSourceHasGrouping,
      );
    });

    expect(dataSourceHasGroupingForAllRows).toEqual([
      true, // "Italy" Group
      true, // "Italy Rome" Group
      true, // Italy > Rome > Giuseppe
      true, // Italy > Rome > Marco
      true, // "Italy Napoli" Group
      true, // Italy > Napoli > Luca
      true, // "USA" Group
      true, // "USA LA" Group
      true, // USA > LA > Bob
    ]);
  });

  test('rowInfo.directChildrenCount be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const directChildrenCountForAllRows = await page.evaluate(() => {
      return (window as any).dataArray.map(
        (rowInfo: any) => rowInfo.directChildrenCount,
      );
    });

    expect(directChildrenCountForAllRows).toEqual([
      2, // "Italy" Group
      2, // "Italy Rome" Group
      undefined, // Italy > Rome > Giuseppe
      undefined, // Italy > Rome > Marco
      1, // "Italy Napoli" Group
      undefined, // Italy > Napoli > Luca
      1, // "USA" Group
      1, // "USA LA" Group
      undefined, // USA > LA > Bob
    ]);
  });

  test('rowInfo.groupBy be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const groupByForAllRows = await page.evaluate(() => {
      return (window as any).dataArray.map((rowInfo: any) => rowInfo.groupBy);
    });

    expect(groupByForAllRows).toEqual([
      ['country'], // "Italy" Group
      ['country', 'city'], // "Italy Rome" Group
      ['country', 'city'], // Italy > Rome > Giuseppe
      ['country', 'city'], // Italy > Rome > Marco
      ['country', 'city'], // "Italy Napoli" Group
      ['country', 'city'], // Italy > Napoli > Luca
      ['country'], // "USA" Group
      ['country', 'city'], // "USA LA" Group
      ['country', 'city'], // USA > LA > Bob
    ]);
  });

  test('rowInfo.groupCount be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const groupCountForAllRows = await page.evaluate(() => {
      return (window as any).dataArray.map(
        (rowInfo: any) => rowInfo.groupCount,
      );
    });

    expect(groupCountForAllRows).toEqual([
      3, // "Italy" Group
      2, // "Italy Rome" Group
      2, // Italy > Rome > Giuseppe
      2, // Italy > Rome > Marco
      1, // "Italy Napoli" Group
      1, // Italy > Napoli > Luca
      1, // "USA" Group
      1, // "USA LA" Group
      1, // USA > LA > Bob
    ]);
  });

  test('rowInfo.groupData be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const groupDataForAllRows = await page.evaluate(() => {
      return (window as any).dataArray.map((rowInfo: any) => rowInfo.groupData);
    });

    expect(groupDataForAllRows).toEqual([
      filterBy('country', 'Italy', data), // "Italy" Group
      filterBy(['country', 'city'], ['Italy', 'Rome'], data), // "Italy Rome" Group
      undefined, // Italy > Rome > Giuseppe
      undefined, // Italy > Rome > Marco
      filterBy(['country', 'city'], ['Italy', 'Napoli'], data), // "Italy Napoli" Group
      undefined, // Italy > Napoli > Luca
      filterBy(['country'], ['USA'], data), // "USA" Group
      filterBy(['country', 'city'], ['USA', 'LA'], data), // "USA LA" Group
      undefined, // USA > LA > Bob
    ]);
  });

  test('rowInfo.value be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const values = await page.evaluate(() => {
      return (window as any).dataArray.map(
        (rowInfo: any) => rowInfo.value || rowInfo.data.firstName,
      );
    });

    expect(values).toEqual([
      'Italy', // "Italy" Group
      'Rome', // "Italy Rome" Group
      'Giuseppe', // Italy > Rome > Giuseppe
      'Marco', // Italy > Rome > Marco
      'Napoli', // "Italy Napoli" Group
      'Luca', // Italy > Napoli > Luca
      'USA', // "USA" Group
      'LA', // "USA LA" Group
      'Bob', // USA > LA > Bob
    ]);
  });

  test('rowInfo.parents be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const parents = await page.evaluate(() => {
      return (window as any).dataArray.map((rowInfo: any) =>
        rowInfo.parents.map((p: any) => p.id),
      );
    });

    expect(parents).toEqual([
      [], // "Italy" Group
      ['Italy'], // "Italy Rome" Group
      ['Italy', 'Italy,Rome'], // Italy > Rome > Giuseppe
      ['Italy', 'Italy,Rome'], // Italy > Rome > Marco
      ['Italy'], // Italy > Napoli
      ['Italy', 'Italy,Napoli'], // Italy > Napoli > Luca
      [], // "USA" group
      ['USA'], // "USA LA" Group
      ['USA', 'USA,LA'], // USA > LA > Bob
    ]);
  });

  test('rowInfo.indexInParentGroups be correctly set', async ({ page }) => {
    await page.waitForInfinite();

    const indexInParentGroupsForAllRows = await page.evaluate(() => {
      return (window as any).dataArray.map(
        (rowInfo: any) => rowInfo.indexInParentGroups,
      );
    });

    expect(indexInParentGroupsForAllRows).toEqual([
      [0], // "Italy" Group
      [0, 0], // "Italy Rome" Group
      [0, 0, 0], // Italy > Rome > Giuseppe
      [0, 0, 1], // Italy > Rome > Marco
      [0, 1], // "Italy Napoli" Group
      [0, 1, 0], // Italy > Napoli > Luca
      [1], // "USA" Group
      [1, 0], // "USA LA" Group
      [1, 0, 0], // USA > LA > Bob
    ]);
  });
});
