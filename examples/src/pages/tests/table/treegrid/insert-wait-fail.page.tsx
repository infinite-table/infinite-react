import {
  DataSourceApi,
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';

import { useState } from 'react';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  mimeType?: string;
  sizeInKB: number;
  hierarchyPosition: number;
  children?: FileSystemNode[];
};

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: {
    field: 'name',
    header: 'Name',
    renderTreeIcon: true,
    renderValue: ({ value, data }) => {
      return (
        <>
          {value} - {data!.id}
        </>
      );
    },
  },
  type: { field: 'type', header: 'Type' },
  extension: { field: 'extension', header: 'Extension' },
  mimeType: { field: 'mimeType', header: 'Mime Type' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
};

export default function App() {
  const [dataSourceApi, setDataSourceApi] =
    useState<DataSourceApi<FileSystemNode> | null>(null);

  return (
    <>
      <div
        style={{
          color: 'var(--infinite-cell-color)',
          padding: '10px',
        }}
      >
        <div style={{ display: 'flex', gap: 10, padding: 10 }}>
          <button
            onClick={() => {
              dataSourceApi?.addDataArray(dataSource());
            }}
          >
            Add initial data
          </button>

          <button
            onClick={() => {
              if (!dataSourceApi) {
                return;
              }

              // dataSourceApi.addData({
              //   id: '2',
              //   name: 'Desktop',
              //   sizeInKB: 1000,
              //   type: 'folder',
              //   hierarchyPosition: 0,
              // });

              dataSourceApi.updateChildrenByNodePath(
                (children) => {
                  return [
                    ...(children ?? []),
                    {
                      id: '20',
                      hierarchyPosition: 1,
                      name: 'unknown.txt',
                      sizeInKB: 100,
                      type: 'file',
                    },
                  ];
                },
                ['2'],
              );
            }}
          >
            fail
          </button>
        </div>
      </div>
      <TreeDataSource
        nodesKey="children"
        primaryKey="id"
        data={[]}
        onReady={setDataSourceApi}
      >
        <TreeGrid
          columns={columns}
          domProps={{
            style: {
              margin: '5px',
              height: 900,
              border: '1px solid gray',
              position: 'relative',
            },
          }}
        />
      </TreeDataSource>
    </>
  );
}

const dataSource = () => {
  const nodes: FileSystemNode[] = [
    {
      id: '1',
      name: 'Documents',
      sizeInKB: 1200,
      type: 'folder',
      hierarchyPosition: 1,
      children: [
        {
          id: '10',
          name: 'Private',
          hierarchyPosition: 7,
          sizeInKB: 100,
          type: 'folder',
          children: undefined,
        },
        {
          id: '11',
          name: 'Public',
          hierarchyPosition: 2,
          sizeInKB: 100,
          type: 'folder',
          children: undefined,
        },
      ],
    },
  ];
  return nodes;
};
