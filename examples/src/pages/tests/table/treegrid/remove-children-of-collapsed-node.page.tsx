import * as React from 'react';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-react';
import {
  DataSourceApi,
  type InfiniteTableColumn,
} from '@infinite-table/infinite-react';

export type FileSystemNode = {
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemNode[] | null;
  sizeKB?: number;
  id: string;
  collapsed?: boolean;
};

const nodes: FileSystemNode[] = [
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
export default function App() {
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<FileSystemNode> | null>(null);

  const removeRowsByPrimaryKey = async () => {
    if (!dataSourceApi) {
      return;
    }

    dataSourceApi.removeDataArray([{ id: '3' }, { id: '7' }]);
  };

  return (
    <>
      <button type="button" onClick={removeRowsByPrimaryKey}>
        Click to remove children
      </button>
      <TreeDataSource<FileSystemNode>
        onReady={setDataSourceApi}
        data={nodes}
        primaryKey="id"
        nodesKey="children"
      >
        <TreeGrid<FileSystemNode>
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
    </>
  );
}
