import {
  DataSourceApi,
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
  TreeSelectionValue,
} from '@infinite-table/infinite-react';
import { useState } from 'react';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  mimeType?: string;
  sizeInKB: number;
  children?: FileSystemNode[];
};

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: {
    field: 'name',
    header: 'Name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
  },
  type: { field: 'type', header: 'Type' },
  extension: { field: 'extension', header: 'Extension' },
  mimeType: { field: 'mimeType', header: 'Mime Type' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
};
const defaultTreeSelection: TreeSelectionValue = {
  defaultSelection: false,
  selectedPaths: [['1', '10'], ['3']],
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
        defaultTreeSelection={defaultTreeSelection}
      >
        <div
          style={{
            color: 'var(--infinite-cell-color)',
            padding: '10px',
          }}
        >
          <button
            onClick={() => {
              dataSourceApi!.treeApi.deselectAll();
            }}
          >
            Deselect all
          </button>
          <button
            onClick={() => {
              dataSourceApi!.treeApi.selectAll();
            }}
          >
            Select all
          </button>
        </div>

        <TreeGrid columns={columns} />
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
      children: [
        {
          id: '10',
          name: 'Private',
          sizeInKB: 100,
          type: 'folder',
          children: [
            {
              id: '100',
              name: 'Report.docx',
              sizeInKB: 210,
              type: 'file',
              extension: 'docx',
              mimeType: 'application/msword',
            },
            {
              id: '101',
              name: 'Vacation.docx',
              sizeInKB: 120,
              type: 'file',
              extension: 'docx',
              mimeType: 'application/msword',
            },
            {
              id: '102',
              name: 'CV.pdf',
              sizeInKB: 108,
              type: 'file',
              extension: 'pdf',
              mimeType: 'application/pdf',
            },
          ],
        },
      ],
    },
    {
      id: '2',
      name: 'Desktop',
      sizeInKB: 1000,
      type: 'folder',
      children: [
        {
          id: '20',
          name: 'unknown.txt',
          sizeInKB: 100,
          type: 'file',
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
          id: '31',
          name: 'Videos',
          sizeInKB: 5400,
          type: 'folder',
          children: [
            {
              id: '310',
              name: 'Vacation.mp4',
              sizeInKB: 108,
              type: 'file',
              extension: 'mp4',
              mimeType: 'video/mp4',
            },
          ],
        },
      ],
    },
  ];
  return Promise.resolve(nodes);
};
