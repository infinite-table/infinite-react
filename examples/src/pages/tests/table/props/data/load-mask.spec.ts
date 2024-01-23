import { test, expect } from '@testing';

export default test.describe.parallel('Load mask', () => {
  test('is applied correctly', async ({ page }) => {
    await page.waitForInfiniteReady();
    const x = page.getByTitle('LoadMask');
    expect(await x.isVisible()).toEqual(true);
    expect(await x.innerText()).toEqual('xxx');
  });
});
