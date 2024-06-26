import { test, expect } from '@testing';

export default test.describe.parallel('Remote sort mode', () => {
  test('should work fine', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const yearCol = tableModel.withColumn('year');
    expect(
      await page.evaluate(() => {
        return (globalThis as any).callCount;
      }),
    ).toEqual(1);

    await yearCol.clickToSort();

    expect(
      await page.evaluate(() => {
        return (globalThis as any).callCount;
      }),
    ).toEqual(2);

    expect(
      await page.evaluate(() => {
        return (globalThis as any).sortInfo;
      }),
    ).toEqual([
      {
        field: 'year',
        id: 'year',
        type: 'number',
        dir: 1,
      },
    ]);

    await yearCol.clickToSort();

    expect(
      await page.evaluate(() => {
        return (globalThis as any).callCount;
      }),
    ).toEqual(3);

    expect(
      await page.evaluate(() => {
        return (globalThis as any).sortInfo;
      }),
    ).toEqual([
      {
        field: 'year',
        id: 'year',
        type: 'number',
        dir: -1,
      },
    ]);
  });
});
