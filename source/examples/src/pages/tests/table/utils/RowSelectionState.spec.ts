import {
  RowSelectionState,
  RowSelectionStateObject,
} from '@src/components/DataSource/RowSelectionState';
import { test, expect } from '@playwright/test';
import { Indexer } from '@infinite-table/infinite-react/components/DataSource/Indexer';

export function buildRowSelectionState(
  rowSelectionStateObject: RowSelectionStateObject | RowSelectionState,
  rows: Record<any, any[]>,
): RowSelectionState<any> {
  const config = {
    getGroupKeysForPrimaryKey: (x: any) => {
      return rows[x] || [];
    },
    getGroupCount(groupKeys: any[]) {
      return Object.keys(rows).filter((k) => {
        return JSON.stringify(groupKeys) === JSON.stringify(rows[k]);
      }).length;
    },
    getGroupKeysDirectlyInsideGroup: (groupKeys: any[]) => {
      return Object.keys(rows)
        .map((k) => rows[k])
        .filter((keys) => {
          return (
            keys.length === groupKeys.length + 1 &&
            groupKeys.reduce((ok, k, index) => {
              return ok && k === keys[index];
            }, true)
          );
        });
    },

    getGroupByLength: () =>
      Object.keys(rows).reduce((len, k) => {
        return Math.max(len, rows[k].length);
      }, 0),
  };

  const state = new RowSelectionState(
    rowSelectionStateObject,
    () => {
      return {
        groupBy: [],
        indexer: new Indexer(),
        groupDeepMap: undefined,
        totalCount: 0,
        lazyLoad: false,
      };
    },
    config,
  );

  return state;
}

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
    debugger;
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

    expect(state.getGroupRowSelectionState(['backend', 'TypeScript'])).toBe(
      null,
    );

    state.deselectRow(12);
    expect(state.isRowDeselected(11)).toBe(true);

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
    debugger;
    expect(state.getGroupRowSelectionState(['backend'])).toBe(true);

    state.deselectGroupRow(['backend', 'TypeScript']);
    state.deselectGroupRow(['backend', 'Rust']);
    expect(state.getGroupRowSelectionState(['backend'])).toBe(null);

    state.deselectRow(16);
    expect(state.getGroupRowSelectionState(['backend'])).toBe(false);
  });
});
