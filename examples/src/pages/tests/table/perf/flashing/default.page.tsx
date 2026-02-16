import { useRef } from 'react';
import {
  type DataSourceApi,
  type InfiniteTableColumn,
  InfiniteTableProps,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';
import { type FileSystemNode, dataSource } from './data';

const fileIds = [
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '110',
  '111',
  '112',
  '113',
  '114',
  '115',
  '116',
  '117',
  '118',
  '119',
  '20',
  '21',
  '22',
  '23',
];

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: {
    field: 'name',
    renderTreeIcon: true,
    header: 'Name',
    style: ({ data }) => ({
      fontWeight: data?.type === 'folder' ? 'bold' : 'normal',
      color: data?.type === 'folder' ? '#60a5fa' : '#d1d5db',
    }),
  },
  type: {
    field: 'type',
    header: 'Type',
    render: ({ value }) => (
      <span
        style={{
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          backgroundColor: value === 'folder' ? '#1e3a8a' : '#374151',
          color: value === 'folder' ? '#93c5fd' : '#9ca3af',
        }}
      >
        {value}
      </span>
    ),
  },
  extension: {
    field: 'extension',
    header: 'Extension',
    render: ({ value }) =>
      value ? (
        <span
          style={{
            fontFamily: 'monospace',
            color: '#34d399',
            fontWeight: '500',
          }}
        >
          .{value}
        </span>
      ) : null,
  },
  mimeType: {
    field: 'mimeType',
    header: 'Mime Type',
    render: ({ value }) =>
      value ? (
        <span
          style={{
            fontSize: '11px',
            color: '#9ca3af',
            fontStyle: 'italic',
          }}
        >
          {value}
        </span>
      ) : null,
  },
  size: {
    field: 'sizeInKB',
    type: 'number',
    header: 'Size (KB)',
    render: ({ value }) => (
      <span
        style={{
          color: value > 1000 ? '#f87171' : value > 500 ? '#fbbf24' : '#4ade80',
          fontWeight: '600',
        }}
      >
        {value.toLocaleString()}
      </span>
    ),
  },
};

const domProps: InfiniteTableProps<FileSystemNode>['domProps'] = {
  style: {
    flex: 1,
  },
};

export default function App() {
  const apiRef = useRef<DataSourceApi<FileSystemNode>>(null);

  const updateCell = () => {
    const randomId = fileIds[Math.floor(Math.random() * fileIds.length)];
    apiRef.current?.updateData({
      id: randomId,
      sizeInKB: Math.floor(Math.random() * 1000),
    });
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <button onClick={updateCell} style={{ padding: '8px 16px' }}>
        Update Cell
      </button>
      <TreeDataSource
        nodesKey="children"
        primaryKey="id"
        data={dataSource}
        onReady={(api) => (apiRef.current = api)}
      >
        <TreeGrid columns={columns} wrapRowsHorizontally domProps={domProps} />
      </TreeDataSource>
    </div>
  );
}
