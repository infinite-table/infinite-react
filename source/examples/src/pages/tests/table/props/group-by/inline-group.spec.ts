// import { getColumnGroupsIds, getHeaderColumnIds } from '../../../../../utils';
import { test } from '@playwright/test';

import { data } from './pivotData';

const countries = new Set<string>();

const agePerCountries = new Map<string, Set<number>>();
data.forEach((x) => {
  countries.add(x.country);

  if (!agePerCountries.get(x.country)) {
    agePerCountries.set(x.country, new Set<number>());
  }
  agePerCountries.get(x.country)?.add(x.age);
});

export default test.describe.parallel('Pivot', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`tests/table/props/group-by/inline-group`);

    // wait for rendering
    await page.waitForSelector('[data-row-index]');
  });
  test.skip('column groups are correct', async () => {
    // const colGroups = await getColumnGroupsIds();
    // expect(colGroups).toEqual([...countries]);
    // const colIds = await getHeaderColumnIds();
    // expect(colIds).toEqual([]);
  });
});
