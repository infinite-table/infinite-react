import { test, expect } from '@testing';

export default test.describe.parallel('Load mask', () => {
  test('loadingText is applied correctly', async ({ page }) => {
    await page.waitForInfiniteReady();
    const x = page.getByTitle('Loading text');
    expect(await x.isVisible()).toEqual(true);
    expect(await x.innerText()).toEqual('Loading developers ...');

    await page.waitForTimeout(600);
    expect(await x.isVisible()).toEqual(false);
  });
});
