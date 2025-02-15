import {
  DataSourceApi,
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';
import { useState } from 'react';
export type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  mimeType?: string;
  sizeInKB: number;
  lastModified?: string;
  owner?: string;
  permissions?: string;
  children?: FileSystemNode[];
};
export const nodes: FileSystemNode[] = [
  {
    id: '1',
    name: 'Documents',
    sizeInKB: 1200,
    type: 'folder',
    children: [
      {
        id: '100',
        name: 'Report.docx',
        sizeInKB: 210,
        type: 'file',
        extension: 'docx',
        mimeType: 'application/msword',
        lastModified: '2025-01-01',
        owner: 'Alice',
        permissions: 'rw-r--r--',
      },
      {
        id: '101',
        name: 'Vacation.docx',
        sizeInKB: 120,
        type: 'file',
        extension: 'docx',
        mimeType: 'application/msword',
        lastModified: '2025-01-02',
        owner: 'Bob',
        permissions: 'rw-r--r--',
      },
      {
        id: '102',
        name: 'CV.pdf',
        sizeInKB: 108,
        type: 'file',
        extension: 'pdf',
        mimeType: 'application/pdf',
        lastModified: '2025-01-03',
        owner: 'Charlie',
        permissions: 'r--r--r--',
      },
    ],
  },

  {
    id: '3',
    name: 'Media',
    sizeInKB: 1000,
    type: 'folder',
    children: [
      {
        id: '300',
        name: 'Jazz.mp3',
        sizeInKB: 500,
        type: 'file',
        extension: 'mp3',
        mimeType: 'audio/mpeg',
        lastModified: '2025-01-09',
        owner: 'Alice',
        permissions: 'rw-r--r--',
      },
      {
        id: '301',
        name: 'Rock.mp3',
        sizeInKB: 700,
        type: 'file',
        extension: 'mp3',
        mimeType: 'audio/mpeg',
        lastModified: '2025-01-10',
        owner: 'Bob',
        permissions: 'rw-------',
      },
    ],
  },
  {
    id: '4',
    name: 'Downloads',
    sizeInKB: 5000,
    type: 'folder',
    children: [
      {
        id: '40',
        name: 'Software',
        sizeInKB: 3500,
        type: 'folder',
        children: [
          {
            id: '400',
            name: 'Installer.exe',
            sizeInKB: 2500,
            type: 'file',
            extension: 'exe',
            mimeType: 'application/octet-stream',
            lastModified: '2025-01-15',
            owner: 'Alice',
            permissions: 'rw-------',
          },
          {
            id: '401',
            name: 'Setup.dmg',
            sizeInKB: 1000,
            type: 'file',
            extension: 'dmg',
            mimeType: 'application/x-apple-diskimage',
            lastModified: '2025-01-16',
            owner: 'Bob',
            permissions: 'rw-rw-r--',
          },
        ],
      },
    ],
  },
];

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: { field: 'name', header: 'Name', renderTreeIcon: true },
  type: { field: 'type', header: 'Type' },
};

const domProps = {
  style: {
    height: '50vh',
    width: 575,
  },
};

export default function App() {
  const [dataSourceApi, setDataSourceApi] =
    useState<DataSourceApi<FileSystemNode> | null>(null);

  return (
    <>
      <TreeDataSource
        onReady={setDataSourceApi}
        nodesKey="children"
        primaryKey="id"
        data={dataSource}
        defaultTreeExpandState={{
          defaultExpanded: false,
          expandedPaths: [],
        }}
      >
        <div
          style={{
            color: 'var(--infinite-cell-color)',
            padding: '10px',
          }}
        >
          <button
            className="bg-blue-500 p-1 m-1 text-white rounded-sm"
            onClick={() => {
              dataSourceApi?.treeApi.expandAll();
            }}
          >
            Expand all
          </button>
          <button
            className="bg-blue-500 p-1 m-1 text-white rounded-sm"
            onClick={() => {
              dataSourceApi?.treeApi.collapseAll();
            }}
          >
            Collapse all
          </button>
        </div>

        <TreeGrid
          columns={columns}
          defaultColumnPinning={{ name: 'start' }}
          domProps={domProps}
        />
      </TreeDataSource>
    </>
  );
}

const dataSource = () => {
  return Promise.resolve(nodes);
};
