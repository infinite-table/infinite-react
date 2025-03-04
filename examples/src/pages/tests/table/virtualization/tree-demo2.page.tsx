import {
  DataSourceApi,
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';
import { useState } from 'react';
import { FileSystemNode, nodes } from './nodes';

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: { field: 'name', header: 'Name 0', renderTreeIcon: true },
  type: { field: 'type', header: 'Type 1' },
  extension: { field: 'extension', header: 'Extension 2' },
  mimeType: { field: 'mimeType', header: 'Mime Type 3' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB) 4' },
  lastModified: { field: 'lastModified', header: 'Last Modified 5' },
  owner: { field: 'owner', header: 'Owner 6' },
  permissions: { field: 'permissions', header: 'Permissions 7' },
};

const domProps = {
  style: {
    height: '1068px',
    width: '500px',
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
          // defaultColumnPinning={{ name: 'start' }}
          domProps={domProps}
        />
      </TreeDataSource>
    </>
  );
}

const dataSource = () => {
  return Promise.resolve(nodes);
};
