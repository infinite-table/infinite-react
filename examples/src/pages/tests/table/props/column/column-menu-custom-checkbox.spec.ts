import { test, expect } from '@testing';

export default test.describe.parallel('Column menu with custom CheckBox', () => {
  test('uses components.CheckBox in the Columns submenu', async ({
    page,
    headerModel,
    columnModel,
  }) => {
    await page.waitForInfinite();

    await headerModel.clickColumnMenuItem('firstName', 'columns');

    const checkboxes = headerModel
      .getColumnMenuLocator()
      .locator('[data-name="custom-checkbox"]');

    await expect(checkboxes).toHaveCount(4);

    await headerModel.clickColumnMenuItem('firstName', 'country', {
      skipOpen: true,
      selector: '[data-name="custom-checkbox"]',
    });

    await expect
      .poll(() => columnModel.getVisibleColumnIds())
      .toEqual(['id', 'firstName', 'currency']);
  });

  test('uses components.CheckBox in the Group by submenu', async ({
    page,
    headerModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toBe(3);

    await headerModel.clickColumnMenuItem('firstName', 'group-by');

    const checkboxes = headerModel
      .getColumnMenuLocator()
      .locator('[data-name="custom-checkbox"]');

    await expect(checkboxes).toHaveCount(4);

    await headerModel.clickColumnMenuItem('firstName', 'country', {
      skipOpen: true,
      selector: '[data-name="custom-checkbox"]',
    });

    // 2 group rows (USA, Canada) + 3 data rows
    await expect.poll(() => rowModel.getRenderedRowCount()).toBe(5);
  });
});
