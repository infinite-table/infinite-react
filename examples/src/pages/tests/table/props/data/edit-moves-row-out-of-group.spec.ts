import { getRowCount } from '@examples/pages/tests/testUtils';
import { test, expect } from '@testing';

/**
 * Rows: 0 frontend group, 1-3 leaves, 4 backend group, 5 leaf, 6 devops group, 7 Dana (alone)
 *
 * Moving Dana to `frontend` removes the devops group: 8 rows become 7 and
 * Dana ends up at index 4. The edit lifecycle callbacks run after the data
 * changed, so they must find her by primary key — reading `dataArray[7]`
 * would throw and unmount the grid.
 */
export default test.describe('editing a row out of its single-row group', () => {
  test('keeps the grid alive and reports the edit on the moved row', async ({
    page,
    editModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    expect(await getRowCount({ page })).toBe(8);
    expect(await rowModel.getTextForCell({ colId: 'firstName', rowIndex: 7 })).toBe('Dana');

    const cell = { colId: 'stack', rowIndex: 7 };
    await editModel.startEdit({ ...cell, event: 'enter', value: 'frontend' });
    await editModel.confirmEdit(cell);

    // devops group is gone, Dana is the last leaf of the frontend group
    await expect.poll(() => getRowCount({ page })).toBe(7);
    expect(await rowModel.getTextForCell({ colId: 'firstName', rowIndex: 4 })).toBe('Dana');
    expect(await rowModel.getTextForCell({ colId: 'stack', rowIndex: 4 })).toBe('frontend');

    await expect
      .poll(() => page.evaluate(() => (globalThis as any).persistedEdits))
      .toEqual([{ id: 5, stack: 'frontend', rowIndex: 4, value: 'frontend' }]);

    expect(pageErrors).toEqual([]);
  });
});
