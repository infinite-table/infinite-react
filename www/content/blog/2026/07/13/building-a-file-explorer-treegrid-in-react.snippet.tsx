// Snippets shown on building-a-file-explorer-treegrid-in-react.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';

{
  //#region start-with-nested-data
  // #highlight
  <TreeDataSource nodesKey="children" primaryKey="id" data={dataSource}>
    <TreeGrid columns={columns} />
  // #endhighlight
  </TreeDataSource>
  //#endregion
}

{
  //#region start-with-nested-data-2
  const dataSource = [
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      children: [ // #highlight
        {
          id: '10',
          name: 'Report.docx',
          type: 'file',
        },
      ], // #highlight
    },
  ];
  //#endregion
}

{
  //#region start-with-nested-data-3
  const columns = {
    name: {
      field: 'name',
      renderTreeIcon: true, // #highlight
    },
  };
  //#endregion
}

{
  //#region node-path-example
  const data = [
    {
      id: '1', // path: ['1']
      name: 'Documents',
      children: [
        {
          id: '10', // path: ['1', '10']
          name: 'Private',
          children: [
            {
              id: '100', // path: ['1', '10', '100']
              name: 'Report.docx',
            },
          ],
        },
      ],
    },
    {
      id: '2', // path: ['2']
      name: 'Media',
      children: [
        {
          id: '20', // path: ['2','20']
          name: 'FamilyTrip.mpeg'
        }
      ]
    }
  ];
  //#endregion
}

{
  //#region restore-expand-and-collapse-state
  const defaultTreeExpandState = {
    defaultExpanded: true,
    collapsedPaths: [
      ['1', '10'],
      ['3', '31'],
    ],
    expandedPaths: [['3']],
  };

  <TreeDataSource defaultTreeExpandState={defaultTreeExpandState} />;
  //#endregion
}

{
  //#region add-tree-aware-selection
  const defaultTreeSelection = {
    defaultSelection: true, // #highlight
    deselectedPaths: [
      ['1', '10'],
      ['3', '31'],
    ],
    selectedPaths: [['3']], // #highlight
  };

  const columns = {
    name: {
      field: 'name',
      renderTreeIcon: true,
      renderSelectionCheckBox: true,
    },
  };
  //#endregion
}

{
  //#region rendering-a-custom-tree-icon
  const renderTreeIcon = ({ rowInfo, toggleCurrentTreeNode }) => {
    if (!rowInfo.isParentNode) {
      return <FileIcon />;
    }

    return (
      <FolderIcon open={rowInfo.nodeExpanded} onClick={toggleCurrentTreeNode} />
    );
  };
  //#endregion
}

export {};
