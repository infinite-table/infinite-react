import { test, expect } from '@testing';

export default test.describe
  .parallel('Master-detail onRowDetailStateChange', () => {
  test('should be called correctly', async ({ page, tableModel }) => {
    await page.waitForInfinite();

    const cell1 = tableModel.withCell({
      colIndex: 1,
      rowIndex: 3,
    });
    const cell2 = tableModel.withCell({
      colIndex: 1,
      rowIndex: 1,
    });

    await cell1.clickDetailIcon();

    const getRowDetails = async () => {
      return page.evaluate(() => (globalThis as any).lastRowDetails);
    };

    expect(await getRowDetails()).toEqual({
      collapseRow: null,
      expandRow: 3,
    });

    await cell2.clickDetailIcon();

    expect(await getRowDetails()).toEqual({
      collapseRow: 1,
      expandRow: null,
    });

    await cell2.clickDetailIcon();

    expect(await getRowDetails()).toEqual({
      collapseRow: null,
      expandRow: 1,
    });
  });
});
