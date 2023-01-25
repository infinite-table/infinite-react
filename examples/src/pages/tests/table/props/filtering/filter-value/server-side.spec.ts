import { test, expect, Response } from '@testing';

export default test.describe.parallel('Server side filtering', () => {
  test('Filters correctly', async ({ page, rowModel, headerModel }) => {
    await page.waitForInfinite();

    expect(await rowModel.getRenderedRowCount()).toEqual(100);

    let length = 0;
    const condition = (response: Response) => {
      const ok =
        response.url().includes('developers') && response.status() === 200;

      if (ok) {
        return response.json().then((resp) => {
          length = resp.totalCount;
          return resp;
        });
      }

      return ok;
    };

    await Promise.all([
      page.waitForResponse(condition),
      page.locator('button[data-name="stack"]').click(),
    ]);

    await page.waitForTimeout(10);

    expect(await rowModel.getRenderedRowCount()).toEqual(length);

    await Promise.all([
      page.waitForResponse(condition),
      page.locator('button[data-name="country"]').click(),
    ]);

    await page.waitForTimeout(10);

    expect(await rowModel.getRenderedRowCount()).toEqual(length);

    const values = await rowModel.getTextForColumnCells({ colId: 'country' });

    expect(values).toEqual(new Array(length).fill('United States'));

    const headerCell = headerModel.getHeaderCellLocator({ colId: 'country' });

    expect(
      await headerCell
        .locator('input[aria-label="Filter for country"]')
        .inputValue(),
    ).toBe('United States');
  });
});
