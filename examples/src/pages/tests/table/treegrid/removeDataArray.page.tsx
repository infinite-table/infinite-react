import * as React from 'react';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-react';
import {
  InfiniteTablePropRowStyle,
  InfiniteTableRowInfo,
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
    const getAllData = dataSourceApi.getRowInfoArray();
    console.log('data source before remove', getAllData);

    const listOfPrimaryKeys = getAllData.map((row: any) => row.data.id);
    console.log('listOfPrimaryKeys', listOfPrimaryKeys);

    await dataSourceApi.removeDataArrayByPrimaryKeys(listOfPrimaryKeys);
    console.log('data source after remove', dataSourceApi.getRowInfoArray());
  };

  const removeRowsByDataRow = async () => {
    if (!dataSourceApi) {
      return;
    }
    const getAllData = dataSourceApi.getRowInfoArray();
    console.log('data source before remove', getAllData);

    const listOfRows = getAllData.map((row: any) => row.data);
    console.log('listOfRows', listOfRows);
    await dataSourceApi.removeDataArray(listOfRows);
    console.log('data source after remove', dataSourceApi.getRowInfoArray());
  };

  const removeById = async () => {
    if (!dataSourceApi) {
      return;
    }
    await dataSourceApi.removeDataByPrimaryKey('3');
  };

  return (
    <>
      <button type="button" onClick={removeRowsByPrimaryKey}>
        Click to removeRowsByPrimaryKey
      </button>
      <button type="button" onClick={removeRowsByDataRow}>
        Click to removeRowsByDataRow
      </button>
      <button type="button" onClick={removeById}>
        Click to remove one by id
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
