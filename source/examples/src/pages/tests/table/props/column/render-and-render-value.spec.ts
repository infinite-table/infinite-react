import { test, expect } from '@testing';

export default test.describe.parallel('Column', () => {
  test('render fn has access to result of renderValue', async ({ page }) => {
    await page.waitForInfinite();

    const target = page.locator('[data-name="target"]');

    expect(await target.innerText()).toEqual('Mark');

    expect(await target.locator('button').innerText()).toEqual('Mark');
  });
});
