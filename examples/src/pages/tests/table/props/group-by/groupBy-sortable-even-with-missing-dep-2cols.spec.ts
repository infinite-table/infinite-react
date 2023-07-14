import { test, expect } from '@testing';

const ascFn = (a: string | number, b: string | number) => Number(a) - Number(b);
const descFn = (a: string | number, b: string | number) =>
  Number(b) - Number(a);

export default test.describe.parallel('Group column', () => {
  test('sortType as fn should work', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const team = tableModel.withColumn('group-by-team');
    const age = tableModel.withColumn('group-by-age');

    expect((await team.getValues()).filter(Boolean)).toEqual([
      'backend',
      'frontend',
    ]);
    const backendAges = ['8', '102', '20'];
    const frontendAges = ['20', '102', '15'];

    const ageNonSorted = [...backendAges, ...frontendAges];
    expect((await age.getValues()).filter(Boolean)).toEqual(ageNonSorted);

    // sort by team asc
    await team.clickToSort();
    expect((await team.getValues()).filter(Boolean)).toEqual([
      'backend',
      'frontend',
    ]);

    // sort by team desc
    await team.clickToSort();
    expect((await team.getValues()).filter(Boolean)).toEqual([
      'frontend',
      'backend',
    ]);

    // expect proper ages
    expect((await age.getValues()).filter(Boolean)).toEqual([
      ...frontendAges,
      ...backendAges,
    ]);

    // now only sort by age
    await age.clickToSort();
    expect((await team.getValues()).filter(Boolean)).toEqual([
      // backend first, as backend has an age of 8, the smallest age value
      'backend',
      'frontend',
    ]);
    // expect proper ages order
    expect((await age.getValues()).filter(Boolean)).toEqual([
      ...backendAges.sort(ascFn),
      ...frontendAges.sort(ascFn),
    ]);

    // now only sort by age desc
    await age.clickToSort();
    expect((await team.getValues()).filter(Boolean)).toEqual([
      'frontend',
      'backend',
    ]);
    // expect proper ages order
    expect((await age.getValues()).filter(Boolean)).toEqual([
      ...frontendAges.sort(descFn),
      ...backendAges.sort(descFn),
    ]);

    // now sort by both team and age, both asc
    await team.clickToSort();
    await age.clickToSort({
      ctrlKey: true,
    });

    expect((await team.getValues()).filter(Boolean)).toEqual([
      'backend',
      'frontend',
    ]);
    expect((await age.getValues()).filter(Boolean)).toEqual([
      ...backendAges.sort(ascFn),
      ...frontendAges.sort(ascFn),
    ]);

    // now sort by team asc and age desc
    await age.clickToSort({
      ctrlKey: true,
    });

    expect((await team.getValues()).filter(Boolean)).toEqual([
      'backend',
      'frontend',
    ]);
    expect((await age.getValues()).filter(Boolean)).toEqual([
      ...backendAges.sort(descFn),
      ...frontendAges.sort(descFn),
    ]);

    // now sort by team desc and age desc
    await team.clickToSort({
      ctrlKey: true,
    });

    expect((await team.getValues()).filter(Boolean)).toEqual([
      'frontend',
      'backend',
    ]);
    expect((await age.getValues()).filter(Boolean)).toEqual([
      ...frontendAges.sort(descFn),
      ...backendAges.sort(descFn),
    ]);
  });
});
