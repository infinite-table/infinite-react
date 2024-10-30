import * as React from 'react';

import {
  DataSourceApi,
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';

import { FileSystemNode, nodes } from './default.data';

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

let times = 0;
export default function DataTestPage() {
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<FileSystemNode> | null>(null);
  return (
    <React.StrictMode>
      <button
        onClick={() => {
          if (times === 0) {
            dataSourceApi!.addDataArray([nodes[0]]);
          } else {
            dataSourceApi!.addDataArray([
              {
                id: `inserted - ${times}`,
                name: `${times}`,
                type: 'file',
                sizeKB: 100,
              },
            ]);
          }
          times++;
        }}
      >
        Add data
      </button>
      <TreeDataSource<FileSystemNode>
        onReady={setDataSourceApi}
        data={[]}
        primaryKey="id"
        nodesKey="children"
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
