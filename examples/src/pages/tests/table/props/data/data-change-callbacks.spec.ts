import { test, expect } from '@testing';

const getLog = (page: any) =>
  page.evaluate(() => (globalThis as any).dataChangeLog);

// what React calls: onDataArrayChange runs in an effect on the data change
// info - on mount too, with the empty array the DataSource starts with
const initialEmpty = ['dataArrayChange', [], 'number', null];
const loaded = ['dataArrayChange', [1, 2, 3], 'number', null];

// until each grid reported its loaded data
const waitForLoaded = (page: any) =>
  expect
    .poll(async () => {
      const log = await getLog(page);
      return ['array', 'promise', 'fn'].every((kind) =>
        log[kind].some(
          (entry: unknown[]) =>
            JSON.stringify(entry) === JSON.stringify(loaded),
        ),
      );
    })
    .toBe(true);

export default test.describe
  .parallel('DataSource data change callbacks', () => {
  test('onDataArrayChange is called with the initial empty array, then with the loaded data', async ({
    page,
  }) => {
    await page.waitForInfinite();

    await waitForLoaded(page);
    // nothing else comes after the data is loaded
    await page.waitForTimeout(300);

    expect(await getLog(page)).toEqual({
      array: [initialEmpty, ['ready'], loaded],
      promise: [initialEmpty, ['ready'], loaded],
      fn: [['data'], initialEmpty, ['ready'], loaded],
    });
  });

  test('onDataArrayChange and onDataMutations report an update', async ({
    page,
  }) => {
    await page.waitForInfinite();
    await waitForLoaded(page);

    await page.evaluate(() => {
      (globalThis as any).dataSourceApis.array.updateData({
        id: 2,
        firstName: 'Marry 2',
      });
    });

    await expect
      .poll(async () => (await getLog(page)).array.length)
      .toBeGreaterThanOrEqual(5);
    await page.waitForTimeout(300);

    expect((await getLog(page)).array).toEqual([
      initialEmpty,
      ['ready'],
      loaded,
      ['dataArrayChange', [1, 2, 3], 'number', 1],
      ['dataMutations', 1],
    ]);
  });
});
