import adjustColumnOrderForAllColumns from '@infinite-table/infinite-react/components/InfiniteTable/hooks/adjustColumnOrderForAllColumns';
import { test, expect } from '@testing';

export default test.describe.parallel('column reordering', () => {
  test('should work fine when dragging column to left', async () => {
    expect(
      adjustColumnOrderForAllColumns({
        // visible columns before the drag
        visibleColumnOrder: ['a', 'c', 'd'],
        // b column is hidden
        existingColumnOrder: ['a', 'b', 'c', 'd'],
        // new column order after d&d
        newColumnOrder: ['c', 'a', 'd'],
        dragColumnId: 'c',
      }),
    ).toEqual(['c', 'a', 'b', 'd']);
  });

  test('should work fine when dragging column to left - test2', async () => {
    expect(
      adjustColumnOrderForAllColumns({
        // visible columns before the drag
        visibleColumnOrder: ['a', 'c', 'd'],
        // b column is hidden
        existingColumnOrder: ['a', 'b', 'c', 'd'],
        // new column order after d&d
        newColumnOrder: ['a', 'c', 'd'],
        dragColumnId: 'c',
      }),
    ).toEqual(['a', 'b', 'c', 'd']);
    // ).toEqual([]);
  });

  test('should work fine when dragging column to left - test3', async () => {
    expect(
      adjustColumnOrderForAllColumns({
        // visible columns before the drag
        visibleColumnOrder: ['a', 'd'],
        // b & c columns are hidden
        existingColumnOrder: ['a', 'b', 'c', 'd'],
        // new column order after d&d
        newColumnOrder: ['d', 'a'],
        dragColumnId: 'd',
      }),
    ).toEqual(['d', 'a', 'b', 'c']);
    // ).toEqual([]);
  });

  test('should work fine when dragging column to right', async () => {
    expect(
      adjustColumnOrderForAllColumns({
        // visible columns before the drag
        visibleColumnOrder: ['a', 'c', 'd'],
        // b column is hidden
        existingColumnOrder: ['a', 'b', 'c', 'd'],
        // new column order after d&d
        newColumnOrder: ['c', 'd', 'a'],
        dragColumnId: 'a',
      }),
    ).toEqual(['b', 'c', 'd', 'a']);
    // ).toEqual([]);
  });

  test('should work fine when dragging column to right - test 2', async () => {
    expect(
      adjustColumnOrderForAllColumns({
        // visible columns before the drag
        visibleColumnOrder: ['a', 'c', 'd'],
        // b column is hidden
        existingColumnOrder: ['a', 'b', 'c', 'd'],
        // new column order after d&d
        newColumnOrder: ['a', 'c', 'd'],
        dragColumnId: 'a',
      }),
    ).toEqual(['a', 'b', 'c', 'd']);

    expect(
      adjustColumnOrderForAllColumns({
        // visible columns before the drag
        visibleColumnOrder: ['a', 'c', 'd'],
        // b column is hidden
        existingColumnOrder: ['a', 'b', 'c', 'd'],
        // new column order after d&d
        newColumnOrder: ['a', 'c', 'd'],
        dragColumnId: 'c',
      }),
    ).toEqual(['a', 'b', 'c', 'd']);
    // ).toEqual([]);
  });
});
