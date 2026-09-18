import { getRowCount } from '@examples/pages/tests/testUtils';
import { test, expect } from '@testing';

/**
 * Rows: 0 frontend group, 1-3 leaves, 4 backend group, 5 Mark, 6 devops group, 7 Dana
 *
 * The page removes Mark from `onEditAccepted`, i.e. inside the frame
 * `api.persistEdit` waits before reading the edited row. Dana moves from
 * index 7 to index 5 while her edit is in flight: persisting by the recorded
 * index would read past the end of the data array (and throw); the edit has
 * to be persisted on the row found by primary key.
 */
export default test.describe('data changes while an edit is being persisted', () => {
  test('the edit is persisted on the moved row', async ({
    page,
    editModel,
    rowModel,
  }) => {
    await page.waitForInfinite();

    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    expect(await getRowCount({ page })).toBe(8);
    expect(await rowModel.getTextForCell({ colId: 'firstName', rowIndex: 7 })).toBe('Dana');

    const cell = { colId: 'firstName', rowIndex: 7 };
    await editModel.startEdit({ ...cell, event: 'enter', value: 'Dana Scully' });
    await editModel.confirmEdit(cell);

    // Mark and the backend group are gone, Dana is now at index 5 — with the new name
    await expect.poll(() => getRowCount({ page })).toBe(6);
    await expect
      .poll(() => rowModel.getTextForCell({ colId: 'firstName', rowIndex: 5 }))
      .toBe('Dana Scully');
    // nobody else was renamed
    for (const [rowIndex, name] of [
      [1, 'John'],
      [2, 'Marry'],
      [3, 'Bill'],
    ] as const) {
      expect(await rowModel.getTextForCell({ colId: 'firstName', rowIndex })).toBe(name);
    }

    await expect
      .poll(() => page.evaluate(() => (globalThis as any).persistedEdits))
      .toEqual([{ id: 5, firstName: 'Dana Scully', rowIndex: 5, value: 'Dana Scully' }]);

    expect(pageErrors).toEqual([]);
  });
});
