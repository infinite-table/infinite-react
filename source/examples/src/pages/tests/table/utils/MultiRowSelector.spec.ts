import { RowSelectionState } from '@src/components/DataSource/RowSelectionState';
import { MultiRowSelector } from '@src/components/InfiniteTable/utils/MultiRowSelector';

import { test, expect } from '@playwright/test';

/**
 * The behavior for these tests has been first reproduced in Finder for MacOS
 * so if you modify some test, make sure you first get the same behavior in Finder file selection
 */
export default test.describe.parallel('MultiRowSelector', () => {
  test('should work when starting with a shift+click', () => {
    const rowSelection = new RowSelectionState({
      deselectedRows: true,
      selectedRows: {},
    });

    const selector = new MultiRowSelector({
      getIdForIndex: (index) => `${index}`,
    });
    selector.rowSelectionState = rowSelection;

    // shift+click row 2, expect all rows up to index 2 (inclusive) to be selected
    selector.multiSelectClick(2);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        0: true,
        1: true,
        2: true,
      },
    });

    // now simple click on row 5, should be the only selection
    selector.resetClick(5);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        5: true,
      },
    });

    // now shift+click on row 7, so rows 5 to 7 should be selected
    selector.multiSelectClick(7);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        5: true,
        6: true,
        7: true,
      },
    });

    // and finally shift+click on row 3, so rows 5 to 3 should be selected
    selector.multiSelectClick(3);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        5: true,
        4: true,
        3: true,
      },
    });
  });

  test('shift clicking should work fine', () => {
    const rowSelection = new RowSelectionState({
      deselectedRows: true,
      selectedRows: {},
    });

    const selector = new MultiRowSelector({
      getIdForIndex: (index) => `${index}`,
    });
    selector.rowSelectionState = rowSelection;

    selector.resetClick(3);

    selector.multiSelectClick(5);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        3: true,
        4: true,
        5: true,
      },
    });

    selector.multiSelectClick(8);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        3: true,
        4: true,
        5: true,
        6: true,
        7: true,
        8: true,
      },
    });

    selector.multiSelectClick(2);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        3: true,
        2: true,
      },
    });
  });

  test('shift clicking in combination with cmd+click used to select rows', () => {
    const rowSelection = new RowSelectionState({
      deselectedRows: true,
      selectedRows: {},
    });

    const selector = new MultiRowSelector({
      getIdForIndex: (index) => `${index}`,
    });

    selector.rowSelectionState = rowSelection;

    selector.resetClick(3);

    selector.multiSelectClick(5);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        3: true,
        4: true,
        5: true,
      },
    });

    selector.singleAddClick(10);
    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        3: true,
        4: true,
        5: true,
        10: true,
      },
    });

    selector.multiSelectClick(8);
    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        3: true,
        4: true,
        5: true,
        10: true,
        9: true,
        8: true,
      },
    });

    selector.multiSelectClick(12);
    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        3: true,
        4: true,
        5: true,
        10: true,
        11: true,
        12: true,
      },
    });
  });

  // tested in finder, with a folder that contains 21 text files, from 0 to 20,
  // so it is very much like this test
  test('should work as in finder, v1', () => {
    const rowSelection = new RowSelectionState({
      deselectedRows: true,
      selectedRows: {},
    });

    const selector = new MultiRowSelector({
      getIdForIndex: (index) => `${index}`,
    });

    selector.rowSelectionState = rowSelection;

    selector.resetClick(5);

    selector.multiSelectClick(10);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        5: true,
        6: true,
        7: true,
        8: true,
        9: true,
        10: true,
      },
    });

    selector.singleAddClick(8);
    selector.singleAddClick(7);
    selector.singleAddClick(6);
    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        5: true,
        9: true,
        10: true,
      },
    });

    selector.multiSelectClick(12);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        5: true,
        9: true,
        10: true,
        11: true,
        12: true,
      },
    });
  });

  // tested in finder, with a folder that contains 21 text files, from 0 to 20,
  // so it is very much like this test
  test('should work as in finder, v2', () => {
    const rowSelection = new RowSelectionState({
      deselectedRows: true,
      selectedRows: {},
    });

    const selector = new MultiRowSelector({
      getIdForIndex: (index) => `${index}`,
    });
    selector.rowSelectionState = rowSelection;

    selector.resetClick(5);

    selector.multiSelectClick(10);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        5: true,
        6: true,
        7: true,
        8: true,
        9: true,
        10: true,
      },
    });

    selector.singleAddClick(8);
    selector.singleAddClick(7);
    selector.singleAddClick(6);
    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        5: true,
        9: true,
        10: true,
      },
    });

    selector.singleAddClick(7);
    selector.multiSelectClick(12);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        5: true,
        7: true,
        8: true,
        9: true,
        10: true,
        11: true,
        12: true,
      },
    });

    selector.multiSelectClick(4);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        4: true,
        5: true,
        6: true,
        7: true,
      },
    });
  });

  // tested in finder, with a folder that contains 21 text files, from 0 to 20,
  // so it is very much like this test
  test('should work as in finder, v3', () => {
    const rowSelection = new RowSelectionState({
      deselectedRows: true,
      selectedRows: {},
    });

    const selector = new MultiRowSelector({
      getIdForIndex: (index) => `${index}`,
    });

    selector.rowSelectionState = rowSelection;

    selector.resetClick(10);

    selector.singleAddClick(6);
    selector.multiSelectClick(4);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        4: true,
        5: true,
        6: true,
        10: true,
      },
    });

    selector.singleAddClick(7);
    selector.singleAddClick(8);

    selector.multiSelectClick(12);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        8: true,
        9: true,
        10: true,
        11: true,
        12: true,
      },
    });

    selector.singleAddClick(4);
    selector.singleAddClick(2);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        8: true,
        9: true,
        10: true,
        11: true,
        12: true,
        4: true,
        2: true,
      },
    });

    selector.multiSelectClick(5);

    expect(rowSelection.getState()).toEqual({
      deselectedRows: true,
      selectedRows: {
        8: true,
        9: true,
        10: true,
        11: true,
        12: true,
        2: true,
        3: true,
        4: true,
        5: true,
      },
    });
  });
});
