// Snippets shown on building-a-file-explorer-treegrid-in-react.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  TreeDataSource,
  TreeGrid,
  type InfiniteTableColumn,
  type InfiniteTablePropColumns,
  type TreeSelectionValue,
} from '@infinite-table/infinite-react';

type FileSystemNode = {
  id: string;
  name: string;
  type?: string;
  children?: FileSystemNode[];
};

// The post writes its column objects without a type (`const columns = { name: { field: 'name' } }`),
// so their `field` is a `string`. They are checked, after the region, against
// the columns of a row type that has any string as a key.
type AnyRow = Record<string, unknown>;

declare function FileIcon(): React.ReactElement;
declare function FolderIcon(props: {
  open: boolean;
  onClick: () => void;
}): React.ReactElement;

export function NestedData(props: {
  dataSource: FileSystemNode[];
  columns: InfiniteTablePropColumns<FileSystemNode>;
}) {
  const { dataSource, columns } = props;
  return (
    //#region start-with-nested-data
    // #highlight
    <TreeDataSource nodesKey="children" primaryKey="id" data={dataSource}>
      <TreeGrid columns={columns} />
      {/* #endhighlight */}
    </TreeDataSource>
    //#endregion
  );
}

export function nestedData() {
  //#region nested-data
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
  const nodes: FileSystemNode[] = dataSource;
  return nodes;
}

export function treeIconColumn() {
  //#region tree-icon-column
  const columns = {
    name: {
      field: 'name',
      renderTreeIcon: true, // #highlight
    },
  };
  //#endregion
  const checked: InfiniteTablePropColumns<AnyRow> = columns;
  return checked;
}

export function nodePaths() {
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
  const nodes: FileSystemNode[] = data;
  return nodes;
}

export function ExpandState(props: { dataSource: FileSystemNode[] }) {
  const { dataSource } = props;

  //#region restore-expand-and-collapse-state
  const defaultTreeExpandState = {
    defaultExpanded: true,
    collapsedPaths: [
      ['1', '10'],
      ['3', '31'],
    ],
    expandedPaths: [['3']],
  };

  <TreeDataSource primaryKey="id" data={dataSource} defaultTreeExpandState={defaultTreeExpandState} />;
  //#endregion
  return null;
}

export function treeSelection() {
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
  const checkedSelection: TreeSelectionValue = defaultTreeSelection;
  const checkedColumns: InfiniteTablePropColumns<AnyRow> = columns;
  return { checkedSelection, checkedColumns };
}

export function customTreeIcon() {
  //#region rendering-a-custom-tree-icon
  const renderTreeIcon: InfiniteTableColumn<FileSystemNode>['renderTreeIcon'] = ({ rowInfo, toggleCurrentTreeNode }) => {
    if (!rowInfo.isParentNode) {
      return <FileIcon />;
    }

    return (
      <FolderIcon open={rowInfo.nodeExpanded} onClick={toggleCurrentTreeNode} />
    );
  };
  //#endregion
  return renderTreeIcon;
}
