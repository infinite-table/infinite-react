import {
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
  const [dataSourceApi, setDataSourceApi] = useState<any>();

  return (
    <>
      <div
        style={{
          color: 'var(--infinite-cell-color)',
          padding: '10px',
        }}
      >
        <div>Use the buttons below to update the current active node.</div>
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

              dataSourceApi.updateChildrenByNodePath(
                (currentChildren: any) => {
                  return [
                    ...(currentChildren || []),
                    {
                      name: 'New Child',
                      type: 'file',
                      hierarchyPosition: 1,
                      sizeInKB: 1234,
                      id: '8',
                    },
                  ];
                },
                ['1', '10'],
              );
            }}
          >
            Add more data
          </button>

          <button
            onClick={() => {
              if (!dataSourceApi) {
                return;
              }
              dataSourceApi.insertData(
                {
                  id: '777',
                  name: 'inserted',
                  type: 'folder',
                  children: [
                    {
                      id: '7777',
                      name: 'child of inserted',
                      type: 'file',
                    },
                  ],
                },
                { position: 'after', primaryKey: '12' },
              );
            }}
          >
            click last
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
        {
          id: '12',
          name: 'Protected',
          hierarchyPosition: 0,
          sizeInKB: 100,
          type: 'folder',
          children: undefined,
        },
      ],
    },
    {
      id: '2',
      name: 'Desktop',
      sizeInKB: 1000,
      type: 'folder',
      hierarchyPosition: 0,
      children: [
        {
          id: '20',
          hierarchyPosition: 1,
          name: 'unknown.txt',
          sizeInKB: 100,
          type: 'file',
        },
        {
          id: '201',
          name: 'test.txt',
          type: 'file',
          hierarchyPosition: 0,
          sizeInKB: 123512,
        },
      ],
    },
  ];
  return nodes;
};
