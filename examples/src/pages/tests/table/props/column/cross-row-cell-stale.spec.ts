import { test, expect } from '@testing';

/**
 * Documents the baseline behaviour that `repaintCellsKey` exists for
 * (see ../repaint-cells-key): cells are memoized and only re-render when
 * their OWN rowInfo changes, so a cell that renders values from other rows
 * keeps showing the old value when one of those other rows is updated.
 *
 * Grouped rows: 0 Enterprise group, 1 Acme, 2 Globex, 3 Initech, 4 SMB group, 5 Hooli, 6 Vandelay
 */
export default test.describe('cross-row cell staleness (no repaintCellsKey)', () => {
  test('only the updated row and the group row repaint; sibling cells keep the old value', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const textFor = (colId: string, rowIndex: number) =>
      rowModel.getTextForCell({ colId, rowIndex });

    for (const rowIndex of [1, 2, 3]) {
      expect(await textFor('groupAvg', rowIndex)).toBe('200');
      expect(await textFor('avgViaApi', rowIndex)).toBe('200');
    }

    // Acme 100 -> 400: Enterprise avg becomes 300
    await page.click('button[data-name="update"]');

    // the group row's aggregation changed -> its rowInfo changed -> repainted
    await expect.poll(() => textFor('revenue', 0)).toBe('300');
    // Acme's own data changed -> repainted
    await expect.poll(() => textFor('groupAvg', 1)).toBe('300');
    await expect.poll(() => textFor('avgViaApi', 1)).toBe('300');

    // Globex & Initech: same data reference, `parents` excluded from the
    // rowInfo diff -> never notified -> stale
    for (const rowIndex of [2, 3]) {
      expect(await textFor('groupAvg', rowIndex)).toBe('200');
      expect(await textFor('avgViaApi', rowIndex)).toBe('200');
    }

    // un-grouping re-renders the table, so the stale cells catch up
    await page.click('input[data-name="grouped"]');

    // flat rows: 0 Acme, 1 Globex, 2 Initech, 3 Hooli, 4 Vandelay
    for (const rowIndex of [0, 1, 2]) {
      await expect.poll(() => textFor('avgViaApi', rowIndex)).toBe('300');
    }

    // ...and the same staleness shows without grouping involved
    await page.click('button[data-name="reset"]');

    await expect.poll(() => textFor('avgViaApi', 0)).toBe('200');
    for (const rowIndex of [1, 2]) {
      expect(await textFor('avgViaApi', rowIndex)).toBe('300');
    }
  });
});
