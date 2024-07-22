import { test, expect } from '@testing';

export default test.describe
  .parallel('Insert data when there is no data', () => {
  test('works correctly', async ({ page, rowModel }) => {
    await page.waitForInfiniteHeader();

    const btn = page.getByRole('button', { name: 'Insert item' });

    expect(await rowModel.getRenderedRowCount()).toBe(0);

    await btn.click();

    expect(await rowModel.getTextForCell({ rowIndex: 0, colIndex: 0 })).toBe(
      '1',
    );
    expect(await rowModel.getTextForCell({ rowIndex: 1, colIndex: 0 })).toBe(
      '2',
    );
  });
});
