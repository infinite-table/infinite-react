import { test, expect } from '@testing';

export default test.describe.parallel('RawList', () => {
  test('should correctly render rows', async ({ page, rowModel }) => {
    await page.waitForInfinite();

    const cellLocator = await rowModel.getCellLocator({
      colId: 'Id',
      rowIndex: 0,
    });

    const row = await cellLocator.elementHandle();

    const height = await page.evaluate(
      //@ts-ignore
      (r) => r.getBoundingClientRect().height,
      row,
    );

    expect(height).toEqual(90);
  });
});
