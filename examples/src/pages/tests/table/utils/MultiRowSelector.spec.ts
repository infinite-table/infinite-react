import { RowSelectionState } from '@src/components/DataSource/RowSelectionState';
import { TreeSelectionState } from '@src/components/DataSource/TreeSelectionState';
import {
  MultiRowSelector,
  MultiRowSelectorRow,
} from '@src/components/InfiniteTable/utils/MultiRowSelector';

import { test, expect } from '@playwright/test';
import { buildRowSelectionState } from './buildRowSelectionState';

const flatRowAt = (index: number): MultiRowSelectorRow => ({
  id: `${index}`,
  isGroupRow: false,
});

function group(groupKeys: any[], collapsed = false): MultiRowSelectorRow {
  return { id: groupKeys.join('/'), isGroupRow: true, groupKeys, collapsed };
}
function leaf(
  id: number,
  groupKeys: any[],
  rowDisabled = false,
): MultiRowSelectorRow {
  return { id, isGroupRow: false, groupKeys, rowDisabled };
}

/**
 * The rows as displayed, grouped by language - Go is collapsed:
 *
 * 0 TypeScript
 * 1   TS 1
 * 2   TS 2
 * 3   TS 3
 * 4 Go (collapsed - contains rows 4 and 5)
 * 5 Rust
 * 6   Rust 1
 * 7   Rust 2
 * 8   Rust 3
 */
const LANGUAGE_ROWS: MultiRowSelectorRow[] = [
  group(['TS']),
  leaf(1, ['TS']),
  leaf(2, ['TS']),
  leaf(3, ['TS']),
  group(['Go'], true),
  group(['Rust']),
  leaf(6, ['Rust']),
  leaf(7, ['Rust']),
  leaf(8, ['Rust']),
];
const LANGUAGE_GROUP_KEYS_BY_ID: Record<any, any[]> = {
  1: ['TS'],
  2: ['TS'],
  3: ['TS'],
  4: ['Go'],
  5: ['Go'],
  6: ['Rust'],
  7: ['Rust'],
  8: ['Rust'],
};

function selectedIds(rowSelection: RowSelectionState, groupKeysById: object) {
  return Object.keys(groupKeysById)
    .map(Number)
    .filter((id) => rowSelection.isRowSelected(id));
}

function buildGroupedSelector(
  rows: MultiRowSelectorRow[],
  groupKeysById: Record<any, any[]>,
  onlyUsePrimaryKeys: boolean,
) {
  const rowSelection = buildRowSelectionState(
    { defaultSelection: false, selectedRows: [], deselectedRows: [] },
    groupKeysById,
    onlyUsePrimaryKeys,
  );
  const selector = new MultiRowSelector({ getRowAt: (index) => rows[index] });
  selector.rowSelectionState = rowSelection;
  return { selector, rowSelection };
}

/**
 * The behavior for these tests has been first reproduced in Finder for MacOS
 * so if you modify some test, make sure you first get the same behavior in Finder file selection
 */

function getState(rowSelection: RowSelectionState) {
  return {
    deselectedRows: true,
    selectedRows: rowSelection.getState().selectedRows!.reduce((acc, rowId) => {
      acc[rowId] = true;
      return acc;
    }, {}),
  };
}
export default test.describe.parallel('MultiRowSelector', () => {
  test('should work when starting with a shift+click', () => {
    const rowSelection = buildRowSelectionState(
      {
        defaultSelection: false,
        selectedRows: [],
      },
      {},
    );

    const selector = new MultiRowSelector({ getRowAt: flatRowAt });
    selector.rowSelectionState = rowSelection;

    // shift+click row 2, expect all rows up to index 2 (inclusive) to be selected
    selector.multiSelectClick(2);

    expect(getState(rowSelection)).toEqual({
      deselectedRows: true,
      selectedRows: {
        0: true,
        1: true,
        2: true,
      },
    });

    // now simple click on row 5, should be the only selection
    selector.resetClick(5);

    expect(getState(rowSelection)).toEqual({
      deselectedRows: true,
      selectedRows: {
        5: true,
      },
    });

    // now shift+click on row 7, so rows 5 to 7 should be selected
    selector.multiSelectClick(7);

    expect(getState(rowSelection)).toEqual({
      deselectedRows: true,
      selectedRows: {
        5: true,
        6: true,
        7: true,
      },
    });

    // and finally shift+click on row 3, so rows 5 to 3 should be selected
    selector.multiSelectClick(3);

    expect(getState(rowSelection)).toEqual({
      deselectedRows: true,
      selectedRows: {
        5: true,
        4: true,
        3: true,
      },
    });
  });

  test('shift clicking should work fine', () => {
    const rowSelection = buildRowSelectionState(
      {
        defaultSelection: false,
        selectedRows: [],
      },
      {},
    );

    const selector = new MultiRowSelector({ getRowAt: flatRowAt });
    selector.rowSelectionState = rowSelection;

    selector.resetClick(3);

    selector.multiSelectClick(5);

    expect(getState(rowSelection)).toEqual({
      deselectedRows: true,
      selectedRows: {
        3: true,
        4: true,
        5: true,
      },
    });

    selector.multiSelectClick(8);

    expect(getState(rowSelection)).toEqual({
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

    expect(getState(rowSelection)).toEqual({
      deselectedRows: true,
      selectedRows: {
        3: true,
        2: true,
      },
    });
  });

  test('shift clicking in combination with cmd+click used to select rows', () => {
    const rowSelection = buildRowSelectionState(
      {
        defaultSelection: false,
        selectedRows: [],
      },
      {},
    );

    const selector = new MultiRowSelector({ getRowAt: flatRowAt });

    selector.rowSelectionState = rowSelection;

    selector.resetClick(3);

    selector.multiSelectClick(5);

    expect(getState(rowSelection)).toEqual({
      deselectedRows: true,
      selectedRows: {
        3: true,
        4: true,
        5: true,
      },
    });

    selector.singleAddClick(10);
    expect(getState(rowSelection)).toEqual({
      deselectedRows: true,
      selectedRows: {
        3: true,
        4: true,
        5: true,
        10: true,
      },
    });

    selector.multiSelectClick(8);
    expect(getState(rowSelection)).toEqual({
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
    expect(getState(rowSelection)).toEqual({
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
    const rowSelection = buildRowSelectionState(
      {
        defaultSelection: false,
        selectedRows: [],
      },
      {},
    );

    const selector = new MultiRowSelector({ getRowAt: flatRowAt });

    selector.rowSelectionState = rowSelection;

    selector.resetClick(5);

    selector.multiSelectClick(10);

    expect(getState(rowSelection)).toEqual({
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
    expect(getState(rowSelection)).toEqual({
      deselectedRows: true,
      selectedRows: {
        5: true,
        9: true,
        10: true,
      },
    });

    selector.multiSelectClick(12);

    expect(getState(rowSelection)).toEqual({
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
    const rowSelection = buildRowSelectionState(
      {
        defaultSelection: false,
        selectedRows: [],
      },
      {},
    );

    const selector = new MultiRowSelector({ getRowAt: flatRowAt });
    selector.rowSelectionState = rowSelection;

    selector.resetClick(5);

    selector.multiSelectClick(10);

    expect(getState(rowSelection)).toEqual({
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
    expect(getState(rowSelection)).toEqual({
      deselectedRows: true,
      selectedRows: {
        5: true,
        9: true,
        10: true,
      },
    });

    selector.singleAddClick(7);
    selector.multiSelectClick(12);

    expect(getState(rowSelection)).toEqual({
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

    expect(getState(rowSelection)).toEqual({
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
    const rowSelection = buildRowSelectionState(
      {
        defaultSelection: false,
        selectedRows: [],
      },
      {},
    );

    const selector = new MultiRowSelector({ getRowAt: flatRowAt });

    selector.rowSelectionState = rowSelection;

    selector.resetClick(10);

    selector.singleAddClick(6);
    selector.multiSelectClick(4);

    expect(getState(rowSelection)).toEqual({
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

    expect(getState(rowSelection)).toEqual({
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

    expect(getState(rowSelection)).toEqual({
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

    expect(getState(rowSelection)).toEqual({
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

  for (const onlyUsePrimaryKeys of [true, false]) {
    const suffix = onlyUsePrimaryKeys ? '' : ' - with group keys';

    test(`shift+click from a leaf to a leaf in a later group selects the collapsed group in between${suffix}`, () => {
      const { selector, rowSelection } = buildGroupedSelector(
        LANGUAGE_ROWS,
        LANGUAGE_GROUP_KEYS_BY_ID,
        onlyUsePrimaryKeys,
      );

      selector.resetClick(2);
      selector.multiSelectClick(7);

      expect(selectedIds(rowSelection, LANGUAGE_GROUP_KEYS_BY_ID)).toEqual([
        2, 3, 4, 5, 6, 7,
      ]);
      expect(rowSelection.getGroupRowSelectionState(['TS'])).toBe(null);
      expect(rowSelection.getGroupRowSelectionState(['Go'])).toBe(true);
      expect(rowSelection.getGroupRowSelectionState(['Rust'])).toBe(null);
    });

    test(`an expanded group row at the end of the range only covers its rows in the range${suffix}`, () => {
      const { selector, rowSelection } = buildGroupedSelector(
        LANGUAGE_ROWS,
        LANGUAGE_GROUP_KEYS_BY_ID,
        onlyUsePrimaryKeys,
      );

      selector.resetClick(2);
      selector.multiSelectClick(7);
      // shift+click the expanded Rust group row - its rows are all past the end of the range
      selector.multiSelectClick(5);

      expect(selectedIds(rowSelection, LANGUAGE_GROUP_KEYS_BY_ID)).toEqual([
        2, 3, 4, 5,
      ]);
      expect(rowSelection.getGroupRowSelectionState(['Rust'])).toBe(false);

      // a wider range never selects less
      selector.multiSelectClick(6);
      expect(selectedIds(rowSelection, LANGUAGE_GROUP_KEYS_BY_ID)).toEqual([
        2, 3, 4, 5, 6,
      ]);

      // shift+click back up - the previous range is replaced
      selector.multiSelectClick(1);
      expect(selectedIds(rowSelection, LANGUAGE_GROUP_KEYS_BY_ID)).toEqual([
        1, 2,
      ]);

      // up to the TypeScript group row: TS 3 is past the anchor, so it stays out
      selector.multiSelectClick(0);
      expect(selectedIds(rowSelection, LANGUAGE_GROUP_KEYS_BY_ID)).toEqual([
        1, 2,
      ]);
      expect(rowSelection.getGroupRowSelectionState(['TS'])).toBe(null);
    });

    test(`an expanded group row as the anchor stays selected as a whole${suffix}`, () => {
      const { selector, rowSelection } = buildGroupedSelector(
        LANGUAGE_ROWS,
        LANGUAGE_GROUP_KEYS_BY_ID,
        onlyUsePrimaryKeys,
      );

      selector.resetClick(5);
      expect(selectedIds(rowSelection, LANGUAGE_GROUP_KEYS_BY_ID)).toEqual([
        6, 7, 8,
      ]);

      // shift+click upwards: the Rust rows are below the range, but the anchor keeps them
      selector.multiSelectClick(3);
      expect(selectedIds(rowSelection, LANGUAGE_GROUP_KEYS_BY_ID)).toEqual([
        3, 4, 5, 6, 7, 8,
      ]);
      expect(rowSelection.getGroupRowSelectionState(['Rust'])).toBe(true);
    });

    test(`expanded group rows without their children displayed are selected as a whole${suffix}`, () => {
      // like in pivot mode - the group rows are expanded, but there are no leaf rows displayed
      const { selector, rowSelection } = buildGroupedSelector(
        [group(['TS']), group(['Go']), group(['Rust'])],
        LANGUAGE_GROUP_KEYS_BY_ID,
        onlyUsePrimaryKeys,
      );

      selector.resetClick(1);
      selector.multiSelectClick(2);
      expect(selectedIds(rowSelection, LANGUAGE_GROUP_KEYS_BY_ID)).toEqual([
        4, 5, 6, 7, 8,
      ]);

      selector.multiSelectClick(0);
      expect(selectedIds(rowSelection, LANGUAGE_GROUP_KEYS_BY_ID)).toEqual([
        1, 2, 3, 4, 5,
      ]);
    });

    test(`a range that starts on a group row and covers a whole expanded group${suffix}`, () => {
      const { selector, rowSelection } = buildGroupedSelector(
        LANGUAGE_ROWS,
        LANGUAGE_GROUP_KEYS_BY_ID,
        onlyUsePrimaryKeys,
      );

      // click the collapsed Go group
      selector.resetClick(4);
      expect(selectedIds(rowSelection, LANGUAGE_GROUP_KEYS_BY_ID)).toEqual([
        4, 5,
      ]);

      // shift+click upwards to TS 1: the expanded TypeScript group row is
      // outside the range, but all its rows are inside it
      selector.multiSelectClick(1);
      expect(selectedIds(rowSelection, LANGUAGE_GROUP_KEYS_BY_ID)).toEqual([
        1, 2, 3, 4, 5,
      ]);
      expect(rowSelection.getGroupRowSelectionState(['TS'])).toBe(true);
    });

    test(`cmd+click toggles a whole group${suffix}`, () => {
      const { selector, rowSelection } = buildGroupedSelector(
        LANGUAGE_ROWS,
        LANGUAGE_GROUP_KEYS_BY_ID,
        onlyUsePrimaryKeys,
      );

      selector.resetClick(4);
      selector.singleAddClick(5);
      expect(selectedIds(rowSelection, LANGUAGE_GROUP_KEYS_BY_ID)).toEqual([
        4, 5, 6, 7, 8,
      ]);

      selector.singleAddClick(5);
      expect(selectedIds(rowSelection, LANGUAGE_GROUP_KEYS_BY_ID)).toEqual([
        4, 5,
      ]);

      // a partly selected group is selected as a whole
      selector.singleAddClick(7);
      selector.singleAddClick(5);
      expect(selectedIds(rowSelection, LANGUAGE_GROUP_KEYS_BY_ID)).toEqual([
        4, 5, 6, 7, 8,
      ]);
    });

    test(`disabled rows are skipped in a range${suffix}`, () => {
      const rows = [...LANGUAGE_ROWS];
      rows[3] = leaf(3, ['TS'], true);
      const { selector, rowSelection } = buildGroupedSelector(
        rows,
        LANGUAGE_GROUP_KEYS_BY_ID,
        onlyUsePrimaryKeys,
      );

      selector.resetClick(1);
      selector.multiSelectClick(4);
      expect(selectedIds(rowSelection, LANGUAGE_GROUP_KEYS_BY_ID)).toEqual([
        1, 2, 4, 5,
      ]);
    });

    test(`nested groups - collapsed child groups count as a whole${suffix}`, () => {
      /**
       * 0 A
       * 1   x (collapsed - rows 1, 2)
       * 2   y
       * 3     row 3
       * 4 B (collapsed - rows 4, 5)
       * 5 C
       * 6   w (collapsed - row 6)
       */
      const rows: MultiRowSelectorRow[] = [
        group(['A']),
        group(['A', 'x'], true),
        group(['A', 'y']),
        leaf(3, ['A', 'y']),
        group(['B'], true),
        group(['C']),
        group(['C', 'w'], true),
      ];
      const groupKeysById = {
        1: ['A', 'x'],
        2: ['A', 'x'],
        3: ['A', 'y'],
        4: ['B', 'z'],
        5: ['B', 'z'],
        6: ['C', 'w'],
      };
      const { selector, rowSelection } = buildGroupedSelector(
        rows,
        groupKeysById,
        onlyUsePrimaryKeys,
      );

      selector.resetClick(1);
      selector.multiSelectClick(4);
      expect(selectedIds(rowSelection, groupKeysById)).toEqual([
        1, 2, 3, 4, 5,
      ]);
      expect(rowSelection.getGroupRowSelectionState(['A'])).toBe(true);
      expect(rowSelection.getGroupRowSelectionState(['C'])).toBe(false);

      // an expanded group row between the ends follows its children
      selector.multiSelectClick(6);
      expect(selectedIds(rowSelection, groupKeysById)).toEqual([
        1, 2, 3, 4, 5, 6,
      ]);
      expect(rowSelection.getGroupRowSelectionState(['C'])).toBe(true);
    });
  }

  test.describe('tree data', () => {
    function node(
      nodePath: any[],
      options: { isParentNode?: boolean; nodeExpanded?: boolean } = {},
    ): MultiRowSelectorRow {
      return {
        id: nodePath[nodePath.length - 1],
        isGroupRow: false,
        nodePath,
        isParentNode: !!options.isParentNode,
        nodeExpanded: options.nodeExpanded,
      };
    }
    const parent = (nodePath: any[], nodeExpanded = true) =>
      node(nodePath, { isParentNode: true, nodeExpanded });

    /**
     * The nodes as displayed - pics is collapsed:
     *
     * 0 docs
     * 1   a
     * 2   b
     * 3 pics (collapsed - contains x and y)
     * 4 music
     * 5   s1
     * 6   s2
     * 7   sub
     * 8     t1
     */
    const TREE_ROWS: MultiRowSelectorRow[] = [
      parent(['docs']),
      node(['docs', 'a']),
      node(['docs', 'b']),
      parent(['pics'], false),
      parent(['music']),
      node(['music', 's1']),
      node(['music', 's2']),
      parent(['music', 'sub']),
      node(['music', 'sub', 't1']),
    ];
    const TREE_PATHS = [
      ['docs'],
      ['docs', 'a'],
      ['docs', 'b'],
      ['pics'],
      ['pics', 'x'],
      ['pics', 'y'],
      ['music'],
      ['music', 's1'],
      ['music', 's2'],
      ['music', 'sub'],
      ['music', 'sub', 't1'],
    ];

    function buildTreeSelector(
      isNodeSelectable?: (row: MultiRowSelectorRow) => boolean,
    ) {
      const treeSelection = new TreeSelectionState(
        { defaultSelection: false, selectedPaths: [] },
        { treePaths: TREE_PATHS },
      );
      const selector = new MultiRowSelector({
        getRowAt: (index) => TREE_ROWS[index],
        isNodeSelectable,
      });
      selector.treeSelectionState = treeSelection;
      return { selector, treeSelection };
    }

    const selectedLeaves = (treeSelection: TreeSelectionState) =>
      treeSelection.getSelectedLeafNodePaths().map((path) => path.join('/'));

    test('click, cmd/ctrl+click and a shift+click range', () => {
      const { selector, treeSelection } = buildTreeSelector();

      selector.resetClick(1);
      expect(selectedLeaves(treeSelection)).toEqual(['docs/a']);

      // a collapsed parent node is selected as a whole,
      // an expanded one follows its children
      selector.multiSelectClick(5);
      expect(selectedLeaves(treeSelection)).toEqual([
        'docs/a',
        'docs/b',
        'pics/x',
        'pics/y',
        'music/s1',
      ]);
      expect(treeSelection.isNodeSelected(['music'])).toBe(null);

      // going down to an expanded parent node selects none of its children
      selector.multiSelectClick(4);
      expect(selectedLeaves(treeSelection)).toEqual([
        'docs/a',
        'docs/b',
        'pics/x',
        'pics/y',
      ]);

      selector.multiSelectClick(8);
      expect(selectedLeaves(treeSelection)).toEqual([
        'docs/a',
        'docs/b',
        'pics/x',
        'pics/y',
        'music/s1',
        'music/s2',
        'music/sub/t1',
      ]);
      expect(treeSelection.isNodeSelected(['music'])).toBe(true);

      // cmd/ctrl+click toggles a parent node as a whole
      selector.singleAddClick(3);
      expect(selectedLeaves(treeSelection)).toEqual([
        'docs/a',
        'docs/b',
        'music/s1',
        'music/s2',
        'music/sub/t1',
      ]);

      // a click selects only the clicked node
      selector.resetClick(6);
      expect(selectedLeaves(treeSelection)).toEqual(['music/s2']);
    });

    test('a parent node as the anchor stays selected as a whole', () => {
      const { selector, treeSelection } = buildTreeSelector();

      selector.resetClick(4);
      expect(selectedLeaves(treeSelection)).toEqual([
        'music/s1',
        'music/s2',
        'music/sub/t1',
      ]);

      selector.multiSelectClick(2);
      expect(selectedLeaves(treeSelection)).toEqual([
        'docs/b',
        'pics/x',
        'pics/y',
        'music/s1',
        'music/s2',
        'music/sub/t1',
      ]);
    });

    test('nodes that are not selectable are skipped', () => {
      const { selector, treeSelection } = buildTreeSelector(
        (row) => row.nodePath?.[0] !== 'pics',
      );

      selector.resetClick(1);
      selector.multiSelectClick(6);
      expect(selectedLeaves(treeSelection)).toEqual([
        'docs/a',
        'docs/b',
        'music/s1',
        'music/s2',
      ]);
    });
  });
});
