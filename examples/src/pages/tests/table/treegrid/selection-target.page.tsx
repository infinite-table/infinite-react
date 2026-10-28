import * as React from 'react';

import {
  DataSourcePropMultiRowSelectionTarget,
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';

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

const HIDDEN_IDS = ['11', '121'];

const treeFilterFunction = ({
  data,
  filterTreeNode,
}: {
  data: FileSystemNode;
  filterTreeNode: (data: FileSystemNode) => FileSystemNode | boolean;
}) => {
  if (!Array.isArray(data.children)) {
    return !HIDDEN_IDS.includes(data.id);
  }
  return filterTreeNode(data);
};

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: {
    field: 'name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
  },
  id: { field: 'id' },
};

const domProps = {
  style: { height: '80vh' },
};

export default function App() {
  const [target, setTarget] =
    React.useState<DataSourcePropMultiRowSelectionTarget>('all');
  const [filtered, setFiltered] = React.useState(false);

  (globalThis as any).setTarget = setTarget;
  (globalThis as any).setFiltered = setFiltered;

  return (
    <TreeDataSource<FileSystemNode>
      data={nodes}
      primaryKey="id"
      selectionMode="multi-row"
      multiRowSelectionTarget={target}
      treeFilterFunction={filtered ? treeFilterFunction : undefined}
    >
      <TreeGrid<FileSystemNode> domProps={domProps} columns={columns} />
    </TreeDataSource>
  );
}
