// import { getColumnGroupsIds, getHeaderColumnIds } from '../../../../../utils';
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

export default describe('Pivot', () => {
  beforeAll(async () => {
    await page.goto(
      `${process.env.BASEURL}/table/props/group-rows-by/inline-group`,
    );
  });

  beforeEach(async () => {
    await page.reload();

    // wait for rendering
    await page.waitForSelector('[data-row-index]');
  });
  xit('column groups are correct', async () => {
    // const colGroups = await getColumnGroupsIds();
    // expect(colGroups).toEqual([...countries]);
    // const colIds = await getHeaderColumnIds();
    // expect(colIds).toEqual([]);
  });
});
