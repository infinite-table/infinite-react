import { test, expect } from '@testing';

export default test.describe.parallel('Custom filter components', () => {
  test('a custom operator switch and a custom editor that sets the value', async ({
    page,
    headerModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toEqual(5);

    const header = headerModel.getHeaderCellLocator({ colId: 'firstName' });
    const editor = header.locator('[data-name="custom-editor"]');
    const operatorSwitch = header.locator('[data-name="custom-switch"]');

    // the custom switch shows the default operator of the filter type
    await expect(operatorSwitch).toHaveText('startsWith');

    // Marry, Mark, Matthew
    await editor.fill('M');
    await expect.poll(() => rowModel.getRenderedRowCount()).toEqual(3);

    // going to the next operator keeps the value and applies it again
    await operatorSwitch.click();
    await expect(operatorSwitch).toHaveText('endsWith');
    expect(await editor.inputValue()).toEqual('M');
    await expect.poll(() => rowModel.getRenderedRowCount()).toEqual(0);

    // Matthew
    await editor.fill('w');
    await expect.poll(() => rowModel.getRenderedRowCount()).toEqual(1);

    // and back to the first operator
    await operatorSwitch.click();
    await expect(operatorSwitch).toHaveText('startsWith');
    await expect.poll(() => rowModel.getRenderedRowCount()).toEqual(0);
  });

  test('operator icons are rendered by the default operator switch', async ({
    page,
    headerModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const header = headerModel.getHeaderCellLocator({ colId: 'stack' });

    await expect(header.locator('[data-name="icon-is"]')).toBeVisible();
    await expect(header.locator('[data-name="icon-isNot"]')).toHaveCount(0);

    await headerModel.filterColumn({ colId: 'stack' }, 'backend');
    await expect.poll(() => rowModel.getRenderedRowCount()).toEqual(2);

    await headerModel.clickFilterOperatorMenuItem({ colId: 'stack' }, 'isNot');

    await expect(header.locator('[data-name="icon-isNot"]')).toBeVisible();
    await expect(header.locator('[data-name="icon-is"]')).toHaveCount(0);
    await expect.poll(() => rowModel.getRenderedRowCount()).toEqual(3);
  });
});
