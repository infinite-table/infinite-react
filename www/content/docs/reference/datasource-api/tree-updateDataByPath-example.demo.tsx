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
  children?: FileSystemNode[];
};

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: { field: 'name', header: 'Name', renderTreeIcon: true },
  type: { field: 'type', header: 'Type' },
  extension: { field: 'extension', header: 'Extension' },
  mimeType: { field: 'mimeType', header: 'Mime Type' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
};

export default function App() {
  const [dataSourceApi, setDataSourceApi] =
    useState<DataSourceApi<FileSystemNode> | null>();
  const [activeIndex, setActiveIndex] = useState(0);
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
              const rowInfo = dataSourceApi!.getRowInfoByIndex(activeIndex);
              if (!rowInfo || !rowInfo.isTreeNode) {
                return;
              }
              const nodePath = rowInfo.nodePath;
              const randomSize = Math.floor(Math.random() * 10000) + 1;

              dataSourceApi!.updateDataByNodePath(
                { sizeInKB: randomSize, name: getRandomFileName() },
                nodePath,
              );
            }}
          >
            Update current node
          </button>
          <button
            onClick={() => {
              const rowInfo = dataSourceApi!.getRowInfoByIndex(activeIndex);
              if (!rowInfo || !rowInfo.isTreeNode) {
                return;
              }
              const nodePath = rowInfo.nodePath;
              dataSourceApi!.updateDataByNodePath(
                {
                  children: undefined,
                },
                nodePath,
              );
            }}
          >
            Remove children
          </button>

          <button
            onClick={() => {
              const rowInfo = dataSourceApi!.getRowInfoByIndex(activeIndex);
              if (!rowInfo || !rowInfo.isTreeNode) {
                return;
              }
              const nodePath = rowInfo.nodePath;
              const count = Math.floor(Math.random() * 5) + 1;
              const generated: FileSystemNode[] = Array.from(
                { length: count },
                () => ({
                  id: `generated-${times++}`,
                  name: getRandomFileName(),
                  sizeInKB: Math.floor(Math.random() * 10000) + 1,
                  type: 'file',
                }),
              );
              dataSourceApi!.updateDataByNodePath(
                {
                  children: [...(rowInfo.data.children || []), ...generated],
                },
                nodePath,
              );
            }}
          >
            Add children
          </button>
        </div>
      </div>
      <TreeDataSource
        nodesKey="children"
        primaryKey="id"
        data={dataSource}
        onReady={setDataSourceApi}
      >
        <TreeGrid
          columns={columns}
          activeRowIndex={activeIndex}
          onActiveRowIndexChange={setActiveIndex}
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
          id: '30',
          name: 'Music - empty',
          sizeInKB: 0,
          type: 'folder',
          children: [],
        },
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

let times = 0;
const getRandomFileName = () => {
  const names = [
    'Report',
    'Vacation',
    'CV',
    'Unknown',
    'Sales.jpg',
    'Finances.xls',
    'Presentation.ppt',
    'Budget.xlsx',
    'Notes.txt',
    'Resume.docx',
    'Agenda.docx',
    'Summary.docx',
    'Proposal.docx',
    'Report.docx',
    'Invoice.pdf',
    'Memo.docx',
    'Letter.docx',
    'Plan.docx',
    'Guide.docx',
  ];
  const name = names[Math.floor(Math.random() * names.length)];
  const [namePart, extension] = name.split('.');
  times++;
  return `${namePart}${times}${extension ? `.${extension}` : ''}`;
};
