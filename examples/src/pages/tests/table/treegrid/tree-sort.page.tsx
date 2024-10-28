import * as React from 'react';

import {
  DataSourceApi,
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';

export type FileSystemNode = {
  name: string;
  children?: FileSystemNode[] | null;
  size: number;
  id: number;
  collapsed?: boolean;
};

export const nodes: FileSystemNode[] = [
  {
    id: 1,
    size: 130,
    name: 'Documents',
    children: [
      {
        id: 2,
        size: 110,
        name: 'Work',
      },
      {
        id: 3,
        size: 20,
        name: 'Vacation',
      },
    ],
  },
  {
    id: 4,
    size: 100,
    name: 'Downloads',
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
  size: { field: 'size', type: 'number' },
};

export default function DataTestPage() {
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<FileSystemNode> | null>(null);
  return (
    <React.StrictMode>
      <div className="flex flex-col gap-2 bg-black justify-start p-10">
        <TreeDataSource<FileSystemNode>
          onReady={setDataSourceApi}
          data={nodes}
          debugMode
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
