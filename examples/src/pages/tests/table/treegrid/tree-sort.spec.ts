import { test, expect } from '@testing';

export default test.describe('Tree sorting', () => {
  test('works as expected', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const sizeCol = tableModel.withColumn('size');

    await sizeCol.clickToSort();
    expect(await sizeCol.getValues()).toEqual(['100', '130', '20', '110']);

    await sizeCol.clickToSort();
    expect(await sizeCol.getValues()).toEqual(['130', '110', '20', '100']);
  });
});
