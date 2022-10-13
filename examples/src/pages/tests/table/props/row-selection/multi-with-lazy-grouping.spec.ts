import { test, expect } from '@testing';

export default test.describe
  .parallel('Collapsing works', () => {
  test.skip('should toggle second level group corectly', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    await page.waitForSelector('[data-row-id="20"]');

    await rowModel.toggleGroupRow(1);
    const text = await rowModel.getTextForCell({
      rowIndex: 2,
      colIndex: 0,
    });

    expect(text).toBe('Go');
  });
});
