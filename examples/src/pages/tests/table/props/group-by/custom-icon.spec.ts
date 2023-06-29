import { test, expect } from '@testing';

export default test.describe.parallel('Header rendering pipeline', () => {
  test('Menu icon should render correctly', async ({ page, headerModel }) => {
    await page.waitForInfinite();

    const locator = await headerModel.getHeaderCellLocator({
      colId: 'name',
    });

    expect(await locator.locator('[data-name="test-icon"]').count()).toBe(1);
  });
});
