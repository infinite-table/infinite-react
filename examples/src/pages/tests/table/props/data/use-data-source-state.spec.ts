import { test, expect } from '@testing';

export default test.describe.parallel('DataSource hook', () => {
  test('should properly update component when state changes', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const p = page.locator('p[data-name="test"]');

    expect(await p.innerText()).toBe('Showing 9 rows.');

    expect(await rowModel.getRenderedRowCount()).toBe(9);

    await rowModel.toggleGroupRow(0);

    expect(await p.innerText()).toBe('Showing 12 rows.');

    expect(await rowModel.getRenderedRowCount()).toBe(12);
  });
});
