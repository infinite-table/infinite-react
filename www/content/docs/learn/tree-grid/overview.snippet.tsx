// Snippets shown on overview.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  TreeDataSource,
  type TreeExpandStateValue,
} from '@infinite-table/infinite-react';

export function nodePaths() {
  //#region node-path-vs-row-id
  const data = [
    { id: '1', name: 'Documents',                // path: ['1'] // #highlight
      children: [
        { id: '10', name: 'Private',             // path: ['1', '10']
          children: [
            { id: '100', name: 'Report.docx' },  // path: ['1', '10', '100'] 
            { id: '101', name: 'Vacation.docx' },// path: ['1', '10', '101']
          ],
        },
      ]
    },
    {
      id: '2',
      name: 'Downloads',                        // path: ['2']
      children: [
        {
          id: '20',
          name: 'cat.jpg',                      // path: ['2', '20']
        },
      ],
    },
  ];
  //#endregion
  return data;
}

export function NodesKey() {
  //#region nested-data-structure-for-the-treedatasource
  const dataSource = [
    { // #highlight
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
          ],
        },
      ],
    },
    {
      id: '2',
      name: 'Downloads',
      children: [] // will be a parent node, with no children
    },
  ];
  //#endregion

  return (
    //#region using-the-nodeskey-prop-to-specify-where-the
    <TreeDataSource
      nodesKey="children" // #highlight
      primaryKey="id"
      data={dataSource}
    />
    //#endregion
  );
}

export function expandStateWithNodePaths() {
  //#region example-of-treeexpandstate-with-node-paths
  const treeExpandState = {
    defaultExpanded: true,
    collapsedPaths: [
      ['1', '10'],
      ['2', '20'],
      ['5']
    ],
    expandedPaths: [
      ['1', '4'],
      ['5','nested node in 5'],
    ],
  };
  //#endregion
  const expandState: TreeExpandStateValue = treeExpandState;
  return expandState;
}
