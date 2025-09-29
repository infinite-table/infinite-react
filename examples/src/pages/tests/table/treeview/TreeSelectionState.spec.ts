import { test, expect } from '@playwright/test';
import { TreeSelectionState } from '@src/components/DataSource/TreeSelectionState';
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
      {
        id: '10',
        name: 'Private',
        children: [
          {
            id: '100',
            name: 'Report.docx',
          },
          {
            id: '101',
            name: 'Vacation.docx',
          },
          {
            id: '102',
            name: 'CV.pdf',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Desktop',
    children: [
      {
        id: '20',
        name: 'unknown.txt',
      },
    ],
  },
  {
    id: '3',
    name: 'Media',
    children: [
      {
        id: '30',
        name: 'Music',
      },
      {
        id: '31',
        name: 'Videos',
        children: [
          {
            id: '310',
            name: 'Vacation.mp4',
          },
          {
            id: '311',
            name: 'Youtube',
            children: [
              {
                id: '3110',
                name: 'Infinity',
              },
              {
                id: '3111',
                name: 'Infinity 2',
              },
            ],
          },
        ],
      },
    ],
  },
];

const treeParams = {
  getNodeChildren: (node: FileSystemNode) => {
    return node.children || [];
  },
  isLeafNode: (node: FileSystemNode) => {
    return node.children === undefined;
  },
  nodesKey: 'children',
  toKey: (node: FileSystemNode) => node.id,
};

const { deepMap, treePaths } = tree(treeParams, nodes);

export default test.describe.parallel('TreeSelectionState', () => {
  test('should work properly', async () => {
    const treeSelectionState = new TreeSelectionState(
      {
        defaultSelection: false,
        selectedPaths: [['3']],
        deselectedPaths: [['3', '31', '311']],
      },
      () => ({
        treePaths,
      }),
    );

    expect(treeSelectionState.isNodeSelected(['3'])).toBe(null);
    expect(treeSelectionState.isNodeSelected(['3', '30'])).toBe(true);
    expect(treeSelectionState.isNodeSelected(['3', '31', '311'])).toBe(false);
    expect(treeSelectionState.isNodeSelected(['3', '31', '311', '3110'])).toBe(
      false,
    );
  });

  test('should work properly - 2', async () => {
    const treeSelectionState = new TreeSelectionState(
      {
        defaultSelection: false,
        selectedPaths: [['3']],
        deselectedPaths: [['3', '31', '311', '3110']],
      },
      () => ({
        treeDeepMap: deepMap,
        treePaths,
      }),
    );

    expect(treeSelectionState.isNodeSelected(['3'])).toBe(null);
    expect(treeSelectionState.isNodeSelected(['3', '30'])).toBe(true);
    expect(treeSelectionState.isNodeSelected(['3', '31', '311'])).toBe(null);
    expect(treeSelectionState.isNodeSelected(['3', '31', '311', '3110'])).toBe(
      false,
    );
    expect(treeSelectionState.isNodeSelected(['3', '31', '311', '3111'])).toBe(
      true,
    );

    expect(treeSelectionState.getSelectedCount()).toBe(3);
  });

  test('DeepMap.getLeafNodesStartingWith should work properly', async () => {
    const result = treePaths.getLeafNodesStartingWith([], (pair) => pair.keys);

    expect(result).toEqual([
      ['1', '10', '100'],
      ['1', '10', '101'],
      ['1', '10', '102'],
      ['2', '20'],
      ['3', '30'],
      ['3', '31', '310'],
      ['3', '31', '311', '3110'],
      ['3', '31', '311', '3111'],
    ]);
  });

  test('getSelectedLeafNodePaths should work properly', async () => {
    const treeSelectionState = new TreeSelectionState(
      {
        defaultSelection: false,
        selectedPaths: [['3'], ['1', '10', '100']],
      },
      () => ({
        treeDeepMap: deepMap,
        treePaths,
      }),
    );

    const result = treeSelectionState.getSelectedLeafNodePaths();

    expect(result).toEqual([
      ['1', '10', '100'],
      ['3', '30'],
      ['3', '31', '310'],
      ['3', '31', '311', '3110'],
      ['3', '31', '311', '3111'],
    ]);
  });

  test('strictCheckPaths should work properly', async () => {
    let treeSelectionState = new TreeSelectionState({
      defaultSelection: false,
      selectedPaths: [
        ['media', 'videos'],
        ['media', 'pictures'],
        ['documents'],
      ],
    });

    expect(treeSelectionState.isNodeSelected(['media', 'videos'])).toBe(false);

    treeSelectionState = new TreeSelectionState(
      {
        defaultSelection: false,
        selectedPaths: [
          ['media', 'videos'],
          ['media', 'pictures'],
          ['documents'],
        ],
      },
      {
        treePaths: [],
        strictCheckPaths: false,
      },
    );

    expect(treeSelectionState.isNodeSelected(['media', 'videos'])).toBe(true);
    expect(treeSelectionState.isNodeSelected(['media', 'other'])).toBe(false);
  });
});
