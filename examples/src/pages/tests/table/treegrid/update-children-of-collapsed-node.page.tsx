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

  const update = async () => {
    if (!dataSourceApi) {
      return;
    }

    dataSourceApi.updateChildrenByNodePath(
      (current) => {
        return [
          ...(current || []),
          {
            name: 'new.txt',
            type: 'file',
            id: '8',
          },
        ];
      },
      ['1', '3'],
    );
  };

  const remove = async () => {
    if (!dataSourceApi) {
      return;
    }

    dataSourceApi.updateChildrenByNodePath(() => {
      return undefined;
    }, ['1', '3']);
  };

  return (
    <>
      <button type="button" onClick={update}>
        update
      </button>
      <button type="button" onClick={remove}>
        remove
      </button>
      <TreeDataSource<FileSystemNode>
        onReady={setDataSourceApi}
        defaultTreeExpandState={{
          defaultExpanded: true,
          collapsedPaths: [['1', '3']],
        }}
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
