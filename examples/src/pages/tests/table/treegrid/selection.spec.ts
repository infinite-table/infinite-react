import { test, expect } from '@testing';

export default test.describe('TreeSelectionProp', () => {
  test('when defined, makes selectionMode default to multi-row', async ({
    page,
  }) => {
    await page.waitForInfinite();

    const checkboxes = await page.$$('.InfiniteBody input[type="checkbox"]');
    expect(checkboxes.length).toBe(7);

    expect(
      await Promise.all(
        checkboxes.map(
          async (checkbox) =>
            await checkbox.evaluate((el) =>
              (el as HTMLInputElement).indeterminate
                ? null
                : (el as HTMLInputElement).checked,
            ),
        ),
      ),
    ).toEqual([null, true, false, false, true, true, true]);
  });
});
