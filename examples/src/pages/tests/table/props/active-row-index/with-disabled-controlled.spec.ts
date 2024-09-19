import { test, expect } from '@testing';

export default test.describe('Disabled rows controlled', () => {
  test('should work fine', async ({ page, rowModel }) => {
    await page.waitForInfinite();

    expect(await rowModel.isRowDisabled(0)).toBe(false);

    await page.getByRole('button', { name: 'Disable All Rows' }).click();

    expect(await rowModel.isRowDisabled(0)).toBe(true);
    expect(await rowModel.isRowDisabled(1)).toBe(true);
    expect(await rowModel.isRowDisabled(2)).toBe(true);
    expect(await rowModel.isRowDisabled(3)).toBe(true);

    await page.getByRole('button', { name: 'Enable All Rows' }).click();

    expect(await rowModel.isRowDisabled(0)).toBe(false);
    expect(await rowModel.isRowDisabled(1)).toBe(false);
    expect(await rowModel.isRowDisabled(2)).toBe(false);
    expect(await rowModel.isRowDisabled(3)).toBe(false);

    const toggleButton = page.getByRole('button', { name: 'Toggle Row 1' });
    await toggleButton.click();
    expect(await rowModel.isRowDisabled(1)).toBe(true);

    await toggleButton.click();
    expect(await rowModel.isRowDisabled(1)).toBe(false);
  });
});
