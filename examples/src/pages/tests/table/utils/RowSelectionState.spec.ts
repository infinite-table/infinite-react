import { test, expect } from '@playwright/test';
import { buildRowSelectionState } from './buildRowSelectionState';

const ROWS = {};
export default test.describe.parallel('RowSelectionState', () => {
  test('should work when grouped in simple case when ids are mentioned', () => {
    const state = buildRowSelectionState(
      {
        selectedRows: [4, 5, 6],
        deselectedRows: [7],
        defaultSelection: true,
      },
      ROWS,
    );

    expect(state.isRowSelected(5, [])).toBe(true);
    expect(state.isRowSelected(7, [])).toBe(false);
    expect(state.isRowSelected(71, [])).toBe(true);

    const stateO = buildRowSelectionState(
      {
        selectedRows: [4, 5, 6],
        deselectedRows: [7],
        defaultSelection: true,
      },
      ROWS,
      true,
    );

    expect(stateO.isRowSelected(5, [])).toBe(true);
    expect(stateO.isRowSelected(7, [])).toBe(false);
    expect(stateO.isRowSelected(71, [])).toBe(true);
  });
  test('isRowSelected should be false when parent group is in deselected groups', () => {
    const rows: Record<any, any[]> = {
      7: ['Rome'],
      10: ['Rome'],
    };

    const state = buildRowSelectionState(
      {
        defaultSelection: true,
        selectedRows: [4, 5, 6],
        deselectedRows: [7, ['Rome']],
      },
      rows,
    );

    expect(state.isRowSelected(10, ['Rome'])).toBe(false);
    expect(state.isRowSelected(10, undefined)).toBe(false);
    expect(state.isRowSelected(7, undefined)).toBe(false);
    expect(state.isRowSelected(7, ['ccc'])).toBe(true);

    const stateWithIds = buildRowSelectionState(
      {
        defaultSelection: true,
        selectedRows: [4, 5, 6],
        deselectedRows: [7, 10],
      },
      rows,
      true,
    );

    expect(stateWithIds.isRowSelected(10)).toBe(false);
    expect(stateWithIds.isRowSelected(7)).toBe(false);
  });

  test('isRowSelected should be true when parent group is in selected groups', () => {
    const rows: Record<any, any[]> = {
      15: ['France', 'Paris'],
      1: ['Paris'],
    };

    const state = buildRowSelectionState(
      {
        defaultSelection: false,
        selectedRows: [4, 5, 15, ['France']],
        deselectedRows: [7, ['Italy']],
      },
      rows,
    );

    expect(state.isRowSelected(15, undefined)).toBe(true);
    expect(state.isRowSelected(1, undefined)).toBe(false);
  });

  test('third scenario - two levels, default: false', () => {
    const rows: Record<any, any[]> = {
      15: ['France', 'Paris'],
      5: ['France', 'Paris'],
      14: ['France', 'Lyon'],
      3: ['France', 'Lyon'],
      1: ['Paris'],
      11: ['Italy'],
    };

    const state = buildRowSelectionState(
      {
        defaultSelection: false,
        selectedRows: [4, 5, 6, ['France'], 11],
        deselectedRows: [7, ['France', 'Paris']],
      },
      rows,
    );

    expect(state.isRowSelected(15, ['France', 'Paris'])).toBe(false);
    expect(state.isRowSelected(15, undefined)).toBe(false);
    expect(state.isRowSelected(51111, ['France'])).toBe(true);
    // expect(state.isRowSelected(15, ['France', 'Paris'])).toBe(false);
    expect(state.isRowSelected(14, ['France', 'Lyon'])).toBe(true);
    expect(state.isRowSelected(15, ['France', 'Paris', 'Test'])).toBe(false);
    expect(state.isRowSelected(15, ['Italy'])).toBe(false);

    expect(state.isRowSelected(11)).toBe(true);
  });

  test.skip('third scenario - two levels, default: true', () => {
    const state = buildRowSelectionState(
      {
        defaultSelection: true,
        selectedRows: [4, 5, 6, ['France']],
        deselectedRows: [7, ['France', 'Paris']],
      },
      ROWS,
    );

    expect(state.isRowSelected(15, ['France'])).toBe(true);
    expect(state.isRowSelected(15, ['France', 'Paris'])).toBe(false);
    expect(state.isRowSelected(15, ['France', 'Lyon'])).toBe(true);
    expect(state.isRowSelected(15, ['France', 'Paris', 'Test'])).toBe(false);
    expect(state.isRowSelected(15, ['Italy'])).toBe(true);
    expect(state.isRowSelected(5, ['Italy'])).toBe(true);
    expect(state.isRowSelected(7, ['Italy'])).toBe(false);
  });
  test.skip('4th scenario - 3 levels', () => {
    const state = buildRowSelectionState(
      {
        defaultSelection: false,

        selectedRows: [4, 5, 6, ['France', 'Paris'], ['France', 'Lyon', 10]],
        deselectedRows: [7, ['France', 'Paris', 'premier'], ['France']],
      },
      ROWS,
    );

    expect(state.isRowSelected(15, ['France'])).toBe(false);
    expect(state.isRowSelected(15, ['France', 'Paris'])).toBe(true);
    expect(state.isRowSelected(15, ['France', 'Lyon'])).toBe(false);
    expect(state.isRowSelected(10, ['France', 'Lyon'])).toBe(true);
    expect(state.isRowSelected(15, ['France', 'Paris', 'second'])).toBe(true);
    expect(state.isRowSelected(15, ['France', 'Lyon', 'second'])).toBe(false);
    expect(state.isRowSelected(15, ['France', 'Paris', 'premier'])).toBe(false);
  });

  test.skip('4th scenario with deselectedrows: true - 3 levels, fullPaths: false', () => {
    const state = buildRowSelectionState(
      {
        selectedRows: [4, 5, 6, ['France', 'Paris'], ['France', 'Lyon']],
        deselectedRows: [],

        defaultSelection: false,
      },
      ROWS,
    );

    expect(state.isRowSelected(15, ['France'])).toBe(false);
    expect(state.isRowSelected(15, ['France', 'Paris'])).toBe(true);
    expect(state.isRowSelected(15, ['France', 'Lyon'])).toBe(true);
    expect(state.isRowSelected(10, ['France', 'Lyon'])).toBe(true);
    expect(state.isRowSelected(15, ['France', 'Paris', 'second'])).toBe(true);
    expect(state.isRowSelected(15, ['France', 'Lyon', 'second'])).toBe(true);
    expect(state.isRowSelected(15, ['France', 'Paris', 'premier'])).toBe(true);
  });

  test('4th scenario with deselectedrows: true - 3 levels, fullPaths: true', () => {
    const rows: Record<any, any[]> = {
      6: ['England', 'test'], //y
      7: ['England', 'test2'], //n
      8: ['England', 'Manchester'], //n
      2: ['England', 'London'], //y
      3: ['England', 'London'], //y
      4: ['France', 'Lyon'], //y
      10: ['France', 'Paris'], //n
    };
    const state = buildRowSelectionState(
      {
        selectedRows: [
          6,
          ['England', 'London'],
          ['France', 'Paris'],
          ['France', 'Lyon'],
        ],
        deselectedRows: [['England'], ['France', 'Paris', 10]],
        defaultSelection: false,
      },
      rows,
    );

    expect(state.isRowSelected(8)).toBe(false);
    expect(state.isRowSelected(7)).toBe(false);
    expect(state.isRowSelected(6)).toBe(true);
    // expect(state.isRowSelected(6, ['England'])).toBe(true);
    // expect(state.isRowSelected(7, ['England', 'Test'])).toBe(false);
    expect(state.isRowSelected(2)).toBe(true);
    expect(state.isGroupRowSelected(['England', 'London'])).toBe(true);

    expect(state.getGroupRowSelectionState(['England'])).toBe(null);
  });

  test.skip('4th scenario - 3 levels, negated', () => {
    const state = buildRowSelectionState(
      {
        defaultSelection: true,
        deselectedRows: [4, 5, 6, ['France', 'Paris'], 10],
        selectedRows: [7, ['France', 'Paris', 'premier'], ['France']],
      },
      ROWS,
    );

    expect(state.isRowSelected(15, ['France'])).toBe(true);
    expect(state.isRowSelected(15, ['France', 'Paris'])).toBe(false);
    expect(state.isRowSelected(15, ['France', 'Lyon'])).toBe(true);
    expect(state.isRowSelected(10, ['France', 'Lyon'])).toBe(false);
    expect(state.isRowSelected(15, ['France', 'Paris', 'second'])).toBe(false);
    expect(state.isRowSelected(15, ['France', 'Lyon', 'second'])).toBe(true);
    expect(state.isRowSelected(15, ['France', 'Paris', 'premier'])).toBe(true);
  });

  test.skip('5th scenario', () => {
    const state = buildRowSelectionState(
      {
        defaultSelection: true,
        deselectedRows: [['France', 'Paris'], ['France', 'Lyon'], 10],
        selectedRows: [['France', 'Paris', 'premier'], 7, ['France']],
      },
      ROWS,
    );

    expect(state.isRowSelected(7, ['France', 'Paris', 'premier'])).toBe(true);
    expect(state.isRowSelected(7111, ['France', 'Paris', 'premier'])).toBe(
      true,
    );
    expect(state.isRowSelected(8, ['France', 'Paris', 'premier'])).toBe(true);

    state.deselectRow(7, ['France', 'Paris', 'premier']);
    expect(state.isRowSelected(7, ['France', 'Paris', 'premier'])).toBe(false);
    expect(state.isRowSelected(77, ['France', 'Paris'])).toBe(false);
    expect(state.isRowSelected(77, ['France', 'Paris', 'x'])).toBe(false);
    // state.selectGroupRow(['France', 'Paris']);
    expect(state.isRowSelected(77, ['France', 'Paris', 'x'])).toBe(false);
    expect(state.isRowSelected(77, ['France', 'Paris'])).toBe(false);
  });

  test.skip('should work correctly with default deselectedRows true', () => {
    const state = buildRowSelectionState(
      {
        defaultSelection: false,
        selectedRows: [3, 'b'],
        deselectedRows: [],
      },
      ROWS,
    );
    expect(state.isRowSelected('b', [])).toEqual(true);
    expect(state.isRowSelected('c', [])).toEqual(false);
    expect(state.isRowSelected(3, [])).toEqual(true);
    state.deselectAll();
    expect(state.isRowSelected(3, [])).toEqual(false);
    state.selectAll();
    expect(state.isRowSelected(3, [])).toEqual(true);
    expect(state.isRowSelected(312, [])).toEqual(true);
    state.deselectRow(312);
    expect(state.isRowSelected(312, [])).toEqual(false);
  });

  test.skip('should work correctly with default selected true', () => {
    const state = buildRowSelectionState(
      {
        deselectedRows: [3, 'b', 515],
        defaultSelection: true,
        selectedRows: [],
      },
      ROWS,
    );
    expect(state.isRowDeselected('b', [])).toEqual(true);
    expect(state.isRowDeselected('dsadasdas', [])).toEqual(false);
    expect(state.isRowDeselected(3, [])).toEqual(true);
    state.selectAll();
    expect(state.isRowDeselected(3, [])).toEqual(false);
    state.deselectAll();
    expect(state.isRowDeselected('x', [])).toEqual(true);
    expect(state.isRowDeselected(3, [])).toEqual(true);
    state.selectRow(3);
    expect(state.isRowDeselected(3, [])).toEqual(false);
  });
  test.skip('should work when cloning', () => {
    const first = buildRowSelectionState(
      {
        deselectedRows: [3, 'b', 515],
        selectedRows: [],
        defaultSelection: true,
      },
      ROWS,
    );
    const second = buildRowSelectionState(first, ROWS);
    expect(second.isRowDeselected('b', [])).toBe(true);
    expect(second.isRowDeselected('c', [])).toBe(false);
  });

  test.skip('isGroupRowSelected - scenario 1', () => {
    const state = buildRowSelectionState(
      {
        defaultSelection: true,
        selectedRows: [4, 5, 6, ['Europe']],
        deselectedRows: [8, ['Europe', 'France']],
      },
      ROWS,
    );

    expect(state.isGroupRowSelected(['Europe'])).toBe(false);
    expect(state.isGroupRowPartlySelected(['Europe'])).toBe(true);
    expect(state.isGroupRowDeselected(['Europe'])).toBe(false);
    expect(state.isGroupRowDeselected(['Europe', 'France'])).toBe(true);
    expect(state.isGroupRowDeselected(['Europe', 'France'])).toBe(false);
    expect(state.isGroupRowSelected(['Europe', 'France'])).toBe(true);
    expect(state.getGroupRowSelectionState(['Europe', 'France'])).toBe(null);
    expect(state.isGroupRowPartlySelected(['Europe', 'France'])).toBe(true);

    // expect(state.isGroupRowSelected(['Europe', 'Spain'], [])).toBe(true);
    // expect(state.isGroupRowSelected(['Europe', 'Spain'], [{ id: 8 }])).toBe(
    //   false,
    // );
    // expect(state.isGroupRowSelected(['Europe', 'France', 'Paris'])).toBe(false);
    // expect(state.isGroupRowSelected(['Europe', 'Spain', 'Paris'])).toBe(true);

    const state1 = buildRowSelectionState(
      {
        defaultSelection: true,
        selectedRows: [],
        deselectedRows: [['Europe', 'France']],
      },
      ROWS,
    );

    expect(state1.isGroupRowSelected(['Australia'])).toBe(true);
    expect(state1.isGroupRowSelected(['Australia', 'test'])).toBe(true);

    expect(state1.getGroupRowSelectionState(['Europe'])).toBe(null);
    expect(state1.getGroupRowSelectionState(['Europe', 'Austria'])).toBe(true);
    expect(state1.getGroupRowSelectionState(['Europe', 'France'])).toBe(false);

    const state2 = buildRowSelectionState(
      {
        defaultSelection: false,
        deselectedRows: [],
        selectedRows: [['Europe', 'France']],
      },
      ROWS,
    );

    expect(state2.isGroupRowSelected(['Australia'])).toBe(false);
    expect(state2.isGroupRowSelected(['Australia', 'test'])).toBe(false);

    expect(state2.getGroupRowSelectionState(['Europe'])).toBe(null);
    expect(state2.getGroupRowSelectionState(['Europe', 'Austria'])).toBe(false);
    expect(state2.getGroupRowSelectionState(['Europe', 'France'])).toBe(true);
  });

  test.skip('isGroupRowSelected - scenario 2', () => {
    const state = buildRowSelectionState(
      {
        selectedRows: [4, 5, 6, ['Europe']],
        defaultSelection: false,
        deselectedRows: [],
      },
      ROWS,
    );

    expect(state.getGroupRowSelectionState(['Europe'])).toBe(true);
    expect(state.getGroupRowSelectionState(['Europe', 'test'])).toBe(true);
    expect(state.getGroupRowSelectionState(['Europe', 'France'])).toBe(true);
    // expect(state.getGroupRowSelectionState(['Europe', 'France', 'Paris'])).toBe(false);
    // expect(state.getGroupRowSelectionState(['Europe', 'Spain', 'Paris'])).toBe(true);
  });

  test.skip('isGroupRowSelected - scenario 3', () => {
    const state = buildRowSelectionState(
      {
        defaultSelection: true,
        selectedRows: [4, 5, 6, ['Europe']],
        deselectedRows: [['Europe', 'Spain']],
      },
      ROWS,
    );

    expect(state.getGroupRowSelectionState(['Europe'])).toBe(null);

    expect(state.getGroupRowSelectionState(['Europe'])).toBe(true);
    expect(state.getGroupRowSelectionState(['Europe'])).toBe(null);
    expect(state.getGroupRowSelectionState(['Europe'])).toBe(null);

    // expect(state.isGroupRowSelected(['Europe', 'France'])).toBe(false);
    // expect(state.isGroupRowSelected(['Europe', 'France', 'Paris'])).toBe(false);
    // expect(state.isGroupRowSelected(['Europe', 'Spain', 'Paris'])).toBe(true);
  });

  test.skip('deselecting an item from a group should keep all the other items selected', () => {
    const state = buildRowSelectionState(
      {
        selectedRows: [['Europe', 'Italy']],
        deselectedRows: [['Europe']],
        defaultSelection: true,
      },
      ROWS,
    );

    expect(state.isGroupRowSelected(['x', 'y'])).toBe(true);
    expect(state.isGroupRowSelected(['Europe', 'Italy'])).toBe(true);
    expect(state.isRowSelected(4, ['Europe', 'Italy'])).toBe(true);
    state.deselectRow(4, ['Europe', 'Italy']);
    expect(state.isRowSelected(4, ['Europe', 'Italy'])).toBe(false);
    expect(state.isRowSelected(5, ['Europe', 'Italy'])).toBe(true);

    expect(state.isGroupRowSelected(['Europe', 'Italy'])).toBe(true);

    const state1 = buildRowSelectionState(
      {
        selectedRows: [['Europe', 'Italy']],
        deselectedRows: [['Europe']],
        defaultSelection: false,
      },
      ROWS,
    );

    expect(state1.isGroupRowSelected(['x', 'y'])).toBe(false);
  });

  test.skip('deselectedRows: true - deselecting an item from a group should keep all the other items selected', () => {
    const state = buildRowSelectionState(
      {
        selectedRows: [['Europe', 'Italy']],
        deselectedRows: [],
        defaultSelection: false,
      },
      ROWS,
    );

    expect(state.isGroupRowSelected(['Europe', 'Italy'])).toBe(true);
    expect(state.isRowSelected(4, ['Europe', 'Italy'])).toBe(true);
    state.deselectRow(4, ['Europe', 'Italy']);
    expect(state.isRowSelected(4, ['Europe', 'Italy'])).toBe(false);
    // expect(state.isRowSelected(5, ['Europe', 'Italy'])).toBe(true);

    // expect(state.isGroupRowSelected(['Europe', 'Italy'])).toBe(false);
  });

  test('deselect item from selected group', () => {
    const rows: Record<any, string[]> = {
      10: ['backend', 'TypeScript'],
      11: ['backend', 'TypeScript'],
      12: ['backend', 'TypeScript'],
      13: ['backend', 'Rust'],
    };
    const state = buildRowSelectionState(
      {
        defaultSelection: false,
        selectedRows: [['backend', 'TypeScript']],
        deselectedRows: [],
      },
      rows,
    );

    expect(state.getGroupRowSelectionState(['backend', 'TypeScript'])).toBe(
      true,
    );
    state.deselectRow(10, ['backend', 'TypeScript']);
    expect(state.getGroupRowSelectionState(['backend', 'TypeScript'])).toBe(
      null,
    );
    expect(state.isRowDeselected(10)).toBe(true);

    state.deselectRow(11, ['backend', 'TypeScript']);
    expect(state.isRowDeselected(11)).toBe(true);
    expect(state.isRowSelected(12)).toBe(true);

    expect(state.getGroupRowSelectionState(['backend', 'TypeScript'])).toBe(
      null,
    );

    state.deselectRow(12);
    expect(state.isRowDeselected(12)).toBe(true);

    expect(state.getGroupRowSelectionState(['backend', 'TypeScript'])).toBe(
      false,
    );

    state.selectGroupRow(['backend', 'TypeScript']);
    expect(state.getGroupRowSelectionState(['backend', 'TypeScript'])).toBe(
      true,
    );

    state.deselectRow(12);
    expect(state.getGroupRowSelectionState(['backend', 'TypeScript'])).toBe(
      null,
    );

    state.selectGroupRow(['backend']);
    expect(state.getGroupRowSelectionState(['backend', 'TypeScript'])).toBe(
      true,
    );

    const state1 = buildRowSelectionState(
      {
        defaultSelection: false,
        selectedRows: [10, 11, 12],
        deselectedRows: [],
      },
      rows,
      true,
    );

    expect(state1.getGroupRowSelectionState(['backend', 'TypeScript'])).toBe(
      true,
    );

    state1.deselectRow(10);
    expect(state1.getGroupRowSelectionState(['backend', 'TypeScript'])).toBe(
      null,
    );
    expect(state1.isRowDeselected(10)).toBe(true);

    state1.deselectRow(11);
    expect(state1.isRowDeselected(11)).toBe(true);
    expect(state1.isRowSelected(12)).toBe(true);

    expect(state1.getGroupRowSelectionState(['backend', 'TypeScript'])).toBe(
      null,
    );

    state1.deselectRow(12);
    expect(state1.isRowDeselected(12)).toBe(true);

    expect(state1.getGroupRowSelectionState(['backend', 'TypeScript'])).toBe(
      false,
    );

    state1.selectGroupRow(['backend', 'TypeScript']);
    expect(state.getGroupRowSelectionState(['backend', 'TypeScript'])).toBe(
      true,
    );

    state1.deselectRow(12);
    expect(state1.getGroupRowSelectionState(['backend', 'TypeScript'])).toBe(
      null,
    );

    state1.selectGroupRow(['backend']);
    expect(state1.getGroupRowSelectionState(['backend', 'TypeScript'])).toBe(
      true,
    );
  });

  test('real world scenario with deselecting multiple rows', () => {
    const rows: Record<any, string[]> = {
      10: ['backend', 'TypeScript'],
      11: ['backend', 'TypeScript'],
      12: ['backend', 'TypeScript'],
      13: ['backend', 'Rust'],
      14: ['backend', 'Rust'],
      15: ['backend', 'Rust'],
      16: ['backend', 'go'],
    };
    const state = buildRowSelectionState(
      {
        defaultSelection: false,
        selectedRows: [],
        deselectedRows: [],
      },
      rows,
    );

    state.selectGroupRow(['backend']);

    expect(state.getGroupRowSelectionState(['backend'])).toBe(true);

    state.deselectGroupRow(['backend', 'TypeScript']);
    state.deselectGroupRow(['backend', 'Rust']);
    expect(state.getGroupRowSelectionState(['backend'])).toBe(null);

    state.deselectRow(16);
    expect(state.getGroupRowSelectionState(['backend'])).toBe(false);
    expect(state.getState()).toEqual({
      defaultSelection: false,
      deselectedRows: [
        ['backend', 'TypeScript'],
        ['backend', 'Rust'],
        ['backend', 'go'],
      ],
      selectedRows: [['backend']],
    });

    const state1 = buildRowSelectionState(
      {
        defaultSelection: false,
        selectedRows: [],
        deselectedRows: [],
      },
      rows,
      true,
    );

    state1.selectGroupRow(['backend']);

    expect(state1.getGroupRowSelectionState(['backend'])).toBe(true);

    state1.deselectGroupRow(['backend', 'TypeScript']);
    state1.deselectGroupRow(['backend', 'Rust']);
    expect(state1.getGroupRowSelectionState(['backend'])).toBe(null);

    state1.deselectRow(16);
    expect(state1.getGroupRowSelectionState(['backend'])).toBe(false);

    state1.selectRow(16);

    expect(state1.getState()).toEqual({
      defaultSelection: false,
      deselectedRows: [],
      selectedRows: [16],
    });

    const state2 = buildRowSelectionState(
      {
        defaultSelection: true,
        selectedRows: [],
        deselectedRows: [],
      },
      rows,
      true,
    );

    state2.selectGroupRow(['backend']);

    expect(state2.getGroupRowSelectionState(['backend'])).toBe(true);

    state2.deselectGroupRow(['backend', 'TypeScript']);
    state2.deselectGroupRow(['backend', 'Rust']);
    expect(state2.getGroupRowSelectionState(['backend'])).toBe(null);

    state2.deselectRow(16);
    expect(state2.getGroupRowSelectionState(['backend'])).toBe(false);
    state2.selectRow(16);

    expect(state2.getState()).toEqual({
      defaultSelection: true,
      deselectedRows: [10, 11, 12, 13, 14, 15],
      selectedRows: [],
    });
  });

  test('test another scenario1', () => {
    const rows: Record<any, string[]> = {
      10: ['backend', 'TypeScript'],
      11: ['backend', 'TypeScript'],
      12: ['backend', 'TypeScript'],
      13: ['backend', 'Rust'],
      14: ['backend', 'Rust'],
      15: ['backend', 'Rust'],
      16: ['backend', 'go'],
    };
    const state = buildRowSelectionState(
      {
        defaultSelection: false,
        selectedRows: [['backend', 'go']],
        deselectedRows: [],
      },
      rows,
    );

    state.deselectRow(16);
    expect(state.getState()).toEqual({
      defaultSelection: false,
      deselectedRows: [['backend', 'go']],
      selectedRows: [],
    });

    const state1 = buildRowSelectionState(
      {
        defaultSelection: false,
        selectedRows: [16],
        deselectedRows: [],
      },
      rows,
      true,
    );

    state1.deselectRow(16);
    expect(state1.getState()).toEqual({
      defaultSelection: false,
      deselectedRows: [],
      selectedRows: [],
    });
  });

  test('test another scenario2', () => {
    const rows: Record<any, string[]> = {
      10: ['backend', 'TypeScript'],
      11: ['backend', 'TypeScript'],
      12: ['backend', 'TypeScript'],
      13: ['backend', 'Rust'],
      14: ['backend', 'Rust'],
      15: ['backend', 'Rust'],
      16: ['backend', 'go'],
      17: ['frontend', 'ts'],
    };
    // const state = buildRowSelectionState(
    //   {
    //     defaultSelection: true,
    //     deselectedRows: [['backend', 'go']],
    //     selectedRows: [],
    //   },
    //   rows,
    // );

    // state.selectRow(16);
    // expect(state.getState()).toEqual({
    //   defaultSelection: true,
    //   selectedRows: [],
    //   deselectedRows: [],
    // });

    const state1 = buildRowSelectionState(
      {
        defaultSelection: true,
        deselectedRows: [['frontend']],
        selectedRows: [],
      },
      rows,
    );

    state1.selectGroupRow(['frontend']);
    expect(state1.getState()).toEqual({
      defaultSelection: true,
      selectedRows: [],
      deselectedRows: [],
    });

    const state2 = buildRowSelectionState(
      {
        defaultSelection: true,
        deselectedRows: [17],
        selectedRows: [],
      },
      rows,
      true,
    );

    state2.selectGroupRow(['frontend']);
    expect(state2.getState()).toEqual({
      defaultSelection: true,
      selectedRows: [],
      deselectedRows: [],
    });
  });

  test('onlyUsePrimaryKeys: true - scenario 1', () => {
    const rows: Record<any, any[]> = {
      7: ['Italy', 'Rome'], //explicitly selected
      10: ['Italy', 'Rome'],
      11: ['Italy', 'Milano'], //explicitly deselected
      12: ['Italy', 'Milano'],
      13: ['France', 'Paris'],
    };

    const state = buildRowSelectionState(
      {
        defaultSelection: true,
        onlyUsePrimaryKeys: true,
        deselectedRows: [11],
        selectedRows: [7],
      },
      rows,
    );

    expect(state.isRowSelected(10)).toBe(true);
    expect(state.getGroupRowSelectionState(['Italy'])).toBe(null);
    expect(state.getGroupRowSelectionState(['Italy', 'Rome'])).toBe(true);

    // expect(state.isRowSelected(10, undefined)).toBe(false);
    // expect(state.isRowSelected(7, undefined)).toBe(false);
    // expect(state.isRowSelected(7, ['ccc'])).toBe(true);

    const state1 = buildRowSelectionState(
      {
        defaultSelection: true,
        onlyUsePrimaryKeys: true,
        deselectedRows: [11],
        selectedRows: [7],
      },
      rows,
      true,
    );

    expect(state1.isRowSelected(10)).toBe(true);
    expect(state1.getGroupRowSelectionState(['Italy'])).toBe(null);
    expect(state1.getGroupRowSelectionState(['Italy', 'Rome'])).toBe(true);
  });
});
