import { expect, test } from '@testing';

export default test.describe.parallel('DataSource.refetchKey', () => {
  test('should work properly and call DataSourceProps.data when changed', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const initialCalls = await page.evaluate(
      () => (window as any).dataSourceCalls,
    );

    expect(await rowModel.getRenderedRowCount()).toBe(5);

    await page.click('button');

    expect(await rowModel.getRenderedRowCount()).toBe(2);

    await page.click('button');

    expect(await rowModel.getRenderedRowCount()).toBe(5);

    expect(await page.evaluate(() => (window as any).dataSourceCalls)).toBe(
      initialCalls + 2,
    );
  });
});
