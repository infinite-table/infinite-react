import { test, expect } from '@testing';

const yearData = [2010, 2007, 2008];

export default test.describe.parallel('Local sort mode', () => {
  test('should work fine', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const yearCol = tableModel.withColumn('year');
    expect(await yearCol.getValues()).toEqual(yearData.map(String));
    expect(
      await page.evaluate(() => {
        return (globalThis as any).callCount;
      }),
    ).toEqual(1);

    await yearCol.clickToSort();

    expect(await yearCol.getValues()).toEqual([...yearData].sort().map(String));

    expect(
      await page.evaluate(() => {
        return (globalThis as any).callCount;
      }),
    ).toEqual(1);

    await yearCol.clickToSort();

    expect(await yearCol.getValues()).toEqual(
      [...yearData].sort().reverse().map(String),
    );
    expect(
      await page.evaluate(() => {
        return (globalThis as any).callCount;
      }),
    ).toEqual(1);

    await yearCol.clickToSort();

    expect(await yearCol.getValues()).toEqual(yearData.map(String));
    expect(
      await page.evaluate(() => {
        return (globalThis as any).callCount;
      }),
    ).toEqual(1);
  });
});
