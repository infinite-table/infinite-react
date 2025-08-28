import { test, expect } from '@testing';

export default test.describe('TreeSelectionProp', () => {
  test('when defined, makes selectionMode default to multi-row', async ({
    page,
  }) => {
    await page.waitForInfinite();

    const headerCheckbox = await page.locator(
      '.InfiniteHeader input[type="checkbox"]',
    );
    expect(
      await headerCheckbox?.evaluate((el) => {
        return {
          checked: (el as HTMLInputElement).checked,
          indeterminate: (el as HTMLInputElement).indeterminate,
        };
      }),
    ).toEqual({ checked: false, indeterminate: true });
  });
});
