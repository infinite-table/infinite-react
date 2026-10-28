import { test, expect } from '@playwright/test';
import {
  TreeSelectionState,
  TreeSelectionStateObject,
} from '@src/components/DataSource/TreeSelectionState';
import { tree } from '@src/utils/groupAndPivot';

type FileSystemNode = {
  id: string;
  name: string;
  children?: FileSystemNode[];
};

const nodes: FileSystemNode[] = [
  {
    id: '1',
    name: 'Documents',
    children: [
      { id: '10', name: 'report.docx' },
      { id: '11', name: 'notes.txt' },
      {
        id: '12',
        name: 'Pictures',
        children: [
          { id: '120', name: 'beach.jpg' },
          { id: '121', name: 'mountain.png' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Desktop',
    children: [{ id: '20', name: 'todo.docx' }],
  },
];

const HIDDEN = new Set(['11', '121']);

const filterNodes = (list: FileSystemNode[]): FileSystemNode[] =>
  list
    .filter((node) => !HIDDEN.has(node.id))
    .map((node) =>
      node.children ? { ...node, children: filterNodes(node.children) } : node,
    );

const treeParams = {
  getNodeChildren: (node: FileSystemNode) => node.children || [],
  isLeafNode: (node: FileSystemNode) => node.children === undefined,
  nodesKey: 'children',
  toKey: (node: FileSystemNode) => node.id,
};

const unfilteredTreePaths = tree(treeParams, nodes).treePaths;
const visibleTreePaths = tree(treeParams, filterNodes(nodes)).treePaths;

function build(
  selection: TreeSelectionStateObject,
  target: 'all' | 'visible',
) {
  return new TreeSelectionState(
    selection,
    target === 'visible'
      ? () => ({
          treePaths: visibleTreePaths,
          unfilteredTreePaths,
          multiRowSelectionTarget: target,
        })
      : () => ({
          treePaths: unfilteredTreePaths,
          multiRowSelectionTarget: target,
        }),
  );
}

const allSelectedLeafPaths = (state: TreeSelectionState) =>
  new TreeSelectionState(state.getState(), {
    treePaths: unfilteredTreePaths,
  }).getSelectedLeafNodePaths();

export default test.describe.parallel('TreeSelectionState - target', () => {
  test('all: node selection and counts include filtered out leaves', () => {
    const state = build({ defaultSelection: false, selectedPaths: [] }, 'all');

    state.selectNode(['1']);
    expect(state.getSelectionCountFor(['1'])).toEqual({
      selectedCount: 4,
      deselectedCount: 0,
    });

    const partial = build(
      {
        defaultSelection: false,
        selectedPaths: [
          ['1', '10'],
          ['1', '12', '120'],
          ['2', '20'],
        ],
      },
      'all',
    );
    expect(partial.isNodeSelected(['1'])).toBe(null);
    expect(partial.getSelectionCountFor([])).toEqual({
      selectedCount: 3,
      deselectedCount: 2,
    });

    partial.selectAll();
    expect(allSelectedLeafPaths(partial)).toHaveLength(5);
  });

  test('visible: node selection and counts only include visible leaves', () => {
    const state = build(
      { defaultSelection: false, selectedPaths: [['1', '11']] },
      'visible',
    );

    state.selectNode(['1']);
    expect(state.isNodeSelected(['1'])).toBe(true);
    expect(state.getSelectionCountFor(['1'])).toEqual({
      selectedCount: 2,
      deselectedCount: 0,
    });
    expect(allSelectedLeafPaths(state)).toEqual([
      ['1', '10'],
      ['1', '11'],
      ['1', '12', '120'],
    ]);

    state.selectAll();
    expect(state.getSelectionCountFor([])).toEqual({
      selectedCount: 3,
      deselectedCount: 0,
    });
    expect(state.getState().defaultSelection).toBe(false);
    expect(allSelectedLeafPaths(state)).toEqual([
      ['1', '10'],
      ['1', '11'],
      ['1', '12', '120'],
      ['2', '20'],
    ]);

    state.deselectAll();
    expect(allSelectedLeafPaths(state)).toEqual([['1', '11']]);
  });

  test('visible: never stores a parent path that covers filtered out leaves', () => {
    const state = build(
      { defaultSelection: false, selectedPaths: [] },
      'visible',
    );

    state.selectNode(['1', '10']);
    state.selectNode(['1', '12', '120']);
    state.selectNode(['2']);

    const { selectedPaths } = state.getState() as { selectedPaths: any[] };
    expect(selectedPaths).not.toContainEqual(['1']);
    expect(selectedPaths).not.toContainEqual(['1', '12']);
    expect(state.isNodeSelected(['1'])).toBe(true);
    expect(allSelectedLeafPaths(state)).toEqual([
      ['1', '10'],
      ['1', '12', '120'],
      ['2', '20'],
    ]);
  });
});
