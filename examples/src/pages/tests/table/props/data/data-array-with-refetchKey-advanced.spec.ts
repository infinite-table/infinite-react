import { test, expect } from '@testing';

// #data-array-with-refetchKey-advanced

export default test.describe.parallel('DataSource.data array', () => {
  test('should refresh when same reference but refetchKey is new', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toBe(5);

    await page.click('button');

    await page.waitForTimeout(50);

    expect(await rowModel.getRenderedRowCount()).toBe(1);
  });
});
