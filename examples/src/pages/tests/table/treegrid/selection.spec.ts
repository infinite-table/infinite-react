import { test, expect } from '@testing';

export default test.describe('TreeSelectionProp', () => {
  test('when defined, makes selectionMode default to multi-row', async ({
    page,
  }) => {
    await page.waitForInfinite();

    async function getCheckboxes() {
      let checkboxes = await page.$$('.InfiniteBody input[type="checkbox"]');

      return await Promise.all(
        checkboxes.map(
          async (checkbox) =>
            await checkbox.evaluate((el) =>
              (el as HTMLInputElement).indeterminate
                ? null
                : (el as HTMLInputElement).checked,
            ),
        ),
      );
    }

    let checkboxes = await getCheckboxes();
    expect(checkboxes.length).toBe(7);

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

    expect(checkboxes).toEqual([null, true, false, false, true, true, true]);

    await page.click('button:text("Select all")');

    checkboxes = await getCheckboxes();
    expect(checkboxes).toEqual([true, true, true, true, true, true, true]);

    expect(
      await headerCheckbox?.evaluate((el) => {
        return {
          checked: (el as HTMLInputElement).checked,
          indeterminate: (el as HTMLInputElement).indeterminate,
        };
      }),
    ).toEqual({ checked: true, indeterminate: false });
  });
});
