import { test, expect } from '@testing';

export default test.describe.parallel('useEffectWithChanges', () => {
  test.beforeEach(async ({ page }) => {
    await page.load();
  });

  test('should be called once initially and then only when there are changes', async ({
    page,
  }) => {
    const counter = page.locator('[data-name="times"]');

    expect(await counter.textContent()).toEqual('1');

    await page.getByText('inc').click();

    expect(await counter.textContent()).toEqual('2');

    await page.getByText('rerender with no effect').click();

    expect(await counter.textContent()).toEqual('2');
  });
});
