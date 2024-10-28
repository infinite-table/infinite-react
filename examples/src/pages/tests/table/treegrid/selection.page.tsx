import * as React from 'react';

import {
  DataSourceApi,
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';

export type FileSystemNode = {
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemNode[] | null;
  sizeKB?: number;
  id: string;
  collapsed?: boolean;
};

export const nodes: FileSystemNode[] = [
  {
    name: 'Documents',
    type: 'folder',
    id: '1',
    children: [
      {
        name: 'report.doc',
        type: 'file',
        sizeKB: 100,
        id: '2',
      },
      {
        type: 'folder',
        name: 'pictures',
        id: '3',
        collapsed: true,
        children: [
          {
            name: 'mountain.jpg',
            type: 'file',
            sizeKB: 302,
            id: '5',
          },
        ],
      },
      {
        type: 'folder',
        name: 'misc',
        id: '4',
        collapsed: true,
        children: [
          {
            name: 'beach.jpg',
            type: 'file',
            sizeKB: 2024,
            id: '6',
          },
        ],
      },
      {
        type: 'file',
        name: 'last.txt',
        id: '7',
      },
    ],
  },
];

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: {
    field: 'name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
    renderValue: ({ value, data }) => {
      return (
        <>
          {value} - {data!.id}
        </>
      );
    },
  },
  type: { field: 'type' },
  sizeKB: { field: 'sizeKB' },
};

export default function DataTestPage() {
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<FileSystemNode> | null>(null);
  return (
    <React.StrictMode>
      <button onClick={() => dataSourceApi!.treeApi.selectAll()}>
        Select all
      </button>
      <TreeDataSource<FileSystemNode>
        onReady={setDataSourceApi}
        data={nodes}
        primaryKey="id"
        nodesKey="children"
        defaultTreeSelection={{
          defaultSelection: true,
          deselectedPaths: [['1', '3']],
        }}
      >
        <TreeGrid<FileSystemNode>
          wrapRowsHorizontally
          domProps={{
            style: {
              margin: '5px',
              height: 900,
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columns={columns}
        />
      </TreeDataSource>
    </React.StrictMode>
  );
}
