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
        id: '10',
      },
      {
        type: 'folder',
        name: 'pictures',
        id: '11',
        children: [
          {
            name: 'vacation.jpg',
            type: 'file',
            sizeKB: 2024,
            id: '110',
          },
          {
            name: 'island.jpg',
            type: 'file',
            sizeKB: 245,
            id: '111',
          },
        ],
      },
      {
        type: 'folder',
        name: 'diverse',
        id: '12',
        children: [
          {
            name: 'beach.jpg',
            type: 'file',
            sizeKB: 2024,
            id: '120',
          },
        ],
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

export default function DataTestPage() {
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<FileSystemNode> | null>(null);
  return (
    <React.StrictMode>
      <div className="flex flex-col gap-2 bg-black justify-start p-10">
        <button
          className="bg-white text-black p-2"
          onClick={() => {
            dataSourceApi!.updateDataByNodePath(
              {
                name: 'my new vacation.jpg',
              },
              ['1', '11', '110'],
            );
          }}
        >
          Update by path
        </button>

        <button
          className="bg-white text-black p-2"
          onClick={() => {
            dataSourceApi!.updateData({
              id: '111',
              name: 'my new island.jpg',
            });
            // dataSourceApi!.updateData({
            //   id: '110',
            //   name: 'my new vacation.jpg',
            //   // children: [
            //   //   {
            //   //     name: 'island.jpg',
            //   //     type: 'file',
            //   //     sizeKB: 245,
            //   //     id: '1111111',
            //   //   },
            //   // ],
            // });
          }}
        >
          Update by id
        </button>
        <TreeDataSource<FileSystemNode>
          onReady={setDataSourceApi}
          data={nodes}
          primaryKey="id"
          nodesKey="children"
          defaultTreeExpandState={{
            defaultExpanded: true,
            collapsedPaths: [['1', '11']],
          }}
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
