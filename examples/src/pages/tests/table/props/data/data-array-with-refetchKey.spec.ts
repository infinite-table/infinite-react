import { test, expect } from '@testing';

export default test.describe.parallel('DataSource.data array', () => {
  test('should refresh when same reference but refetchKey is new', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toBe(1);

    await page.click('button');

    expect(await rowModel.getRenderedRowCount()).toBe(2);
  });
});
