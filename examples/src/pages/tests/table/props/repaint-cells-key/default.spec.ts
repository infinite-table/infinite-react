import { test, expect } from '@testing';

type RenderCounts = Record<string, number>;

const ENTERPRISE_ROWS = [1, 2]; // Globex, Initech - unchanged siblings of Acme (row 0)
const SMB_ROWS = [3, 4]; // Hooli, Vandelay

export default test.describe('repaintCellsKey', () => {
  test('column fn key repaints unchanged sibling cells; no key stays stale; table key repaints only columns without their own key', async ({
    page,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const textFor = async (colId: string, rowIndex: number) =>
      rowModel.getTextForCell({ colId, rowIndex });

    const getRenderCounts = () =>
      page.evaluate(() => ({ ...(globalThis as any).renderCounts }) as RenderCounts);

    for (const rowIndex of ENTERPRISE_ROWS) {
      expect(await textFor('noKey', rowIndex)).toBe('200');
      expect(await textFor('anyChange', rowIndex)).toBe('200');
      expect(await textFor('segmentKey', rowIndex)).toBe('200');
    }
    for (const rowIndex of SMB_ROWS) {
      expect(await textFor('segmentKey', rowIndex)).toBe('20');
    }

    const countsBeforeUpdate = await getRenderCounts();

    // Acme 100 -> 400: Enterprise avg becomes 300, SMB avg unchanged
    await page.click('button[data-name="update"]');

    for (const rowIndex of ENTERPRISE_ROWS) {
      // both function keys repaint the unchanged Enterprise siblings
      await expect
        .poll(() => textFor('anyChange', rowIndex))
        .toBe('300');
      await expect
        .poll(() => textFor('segmentKey', rowIndex))
        .toBe('300');
    }

    // the baseline: without a key, the sibling cells are never re-rendered
    for (const rowIndex of ENTERPRISE_ROWS) {
      expect(await textFor('noKey', rowIndex)).toBe('200');
    }

    const countsAfterUpdate = await getRenderCounts();

    // SMB rows: ids 4 and 5
    for (const rowId of [4, 5]) {
      // "any change" key -> repainted although the SMB avg did not change
      expect(countsAfterUpdate[`anyChange:${rowId}`]).toBeGreaterThan(
        countsBeforeUpdate[`anyChange:${rowId}`],
      );
      // "segment avg" key -> not repainted, its key (the SMB avg) is the same
      expect(countsAfterUpdate[`segmentKey:${rowId}`]).toBe(
        countsBeforeUpdate[`segmentKey:${rowId}`],
      );
    }

    // the fn receives the current and previous DataSource state
    const params = await page.evaluate(
      () => (globalThis as any).lastRepaintCellsKeyParams,
    );
    expect(params.hasPreviousState).toBe(true);
    expect(params.previousLength).toBe(5);
    expect(params.currentLength).toBe(5);

    // bump the table-level key: repaints the columns without their own key...
    await page.click('button[data-name="repaint-all"]');

    for (const rowIndex of ENTERPRISE_ROWS) {
      await expect.poll(() => textFor('noKey', rowIndex)).toBe('300');
    }

    // ...but not the ones with a column-level key (the column key wins)
    const countsAfterRepaintAll = await getRenderCounts();
    for (const rowId of [1, 2, 3, 4, 5]) {
      expect(countsAfterRepaintAll[`segmentKey:${rowId}`]).toBe(
        countsAfterUpdate[`segmentKey:${rowId}`],
      );
      expect(countsAfterRepaintAll[`anyChange:${rowId}`]).toBe(
        countsAfterUpdate[`anyChange:${rowId}`],
      );
    }
  });
});
