import { getFnCalls } from '../../../testUtils/getFnCalls';
import { test, expect } from '@testing';

export default test.describe.parallel('onRenderRangeChange', () => {
  test('should correctly be called', async ({ page, apiModel }) => {
    await page.waitForInfinite();

    let calls = await getFnCalls('onRenderRangeChange', { page });
    expect(calls.length).toEqual(1);

    await apiModel.evaluate((api) => {
      return api.scrollRowIntoView(100);
    });
    await page.waitForTimeout(100);

    calls = await getFnCalls('onRenderRangeChange', { page });
    expect(calls.length).toEqual(2);

    await page.setViewportSize({
      width: 500,
      height: 500,
    });

    await page.waitForTimeout(100);

    calls = await getFnCalls('onRenderRangeChange', { page });
    expect(calls.length).toEqual(3);
  });
});
