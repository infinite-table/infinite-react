import { getFnCalls } from '../../../testUtils/getFnCalls';
import { test, expect } from '@testing';

export default test.describe.parallel('onRenderRangeChange', () => {
  test('should correctly be called', async ({ page, apiModel }) => {
    await page.waitForInfinite();

    await page.waitForTimeout(50);
    let calls = await getFnCalls('onRenderRangeChange', { page });
    let initial = calls.length;

    expect(initial == 1 || initial == 2).toBe(true);

    await apiModel.evaluate((api) => {
      return api.scrollRowIntoView(100);
    });

    await page.waitForFunction(
      (expectedCount) =>
        (window as any).onRenderRangeChange.getCalls().length === expectedCount,
      initial + 1,
    );

    await page.setViewportSize({
      width: 500,
      height: 500,
    });

    await page.waitForFunction(
      (expectedCount) =>
        (window as any).onRenderRangeChange.getCalls().length === expectedCount,
      initial + 2,
    );
  });
});
