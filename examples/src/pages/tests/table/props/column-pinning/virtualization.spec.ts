import { test, expect } from '@testing';

export default test.describe('Virtualization when column pinning is used', () => {
  test('should work correctly', async ({ page, columnModel, tracingModel }) => {
    await page.waitForInfinite();
    const stop = await tracingModel.start();

    await page.evaluate(() => {
      (globalThis as any).api.scrollLeft = 1000;
    });

    const visibleColumnIds = await columnModel.getVisibleColumnIds();
    expect(visibleColumnIds).toEqual([
      'make',
      'id',
      'model',
      'price',
      'year',
      'last',
    ]);

    await stop();
  });
});
