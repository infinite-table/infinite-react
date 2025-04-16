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
        children: [],
      },
      {
        type: 'folder',
        name: 'diverse',
        id: '4',
        children: [
          {
            name: 'beach.jpg',
            type: 'file',
            sizeKB: 2024,
            id: '6',
          },
        ],
      },
    ],
  },
];

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: {
    field: 'name',
    renderTreeIcon: ({ rowInfo }) => {
      if (!rowInfo.isParentNode) {
        return null;
      }
      return (
        <div
          style={{
            display: 'inline-block',
            width: 24,
          }}
        >
          {rowInfo.nodeExpanded ? '👇' : '👉'}
        </div>
      );
    },
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
      <div className="flex flex-col gap-2 bg-black justify-start p-10">
        <button
          className="bg-white text-black p-2"
          onClick={() => {
            dataSourceApi!.updateData({
              id: '3',
              children: undefined,
            });
            dataSourceApi!.insertDataArray(
              [
                {
                  id: 'x',
                  name: 'x',
                  type: 'file',
                },
                {
                  id: 'y',
                  name: 'y',
                  type: 'file',
                },
              ],
              {
                position: 'before',
                primaryKey: '6',
              },
            );
          }}
        >
          Update
        </button>
        <TreeDataSource<FileSystemNode>
          onReady={setDataSourceApi}
          data={nodes}
          primaryKey="id"
          nodesKey="children"
          selectionMode="multi-row"
        >
          <TreeGrid<FileSystemNode>
            wrapRowsHorizontally
            domProps={{
              style: {
                margin: '5px',
                height: '80vh',
                border: '1px solid gray',
                position: 'relative',
              },
            }}
            columns={columns}
            columnDefaultWidth={250}
          />
        </TreeDataSource>
      </div>
    </React.StrictMode>
  );
}
