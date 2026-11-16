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
  children?: FileSystemNode[];
};

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: { field: 'name', renderTreeIcon: true, header: 'Name' },
  type: { field: 'type', header: 'Type' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size' },
};

export default function App() {
  const [wrapRowsHorizontally, setWrapRowsHorizontally] = useState(false);
  return (
    <>
      <div
        style={{
          color: 'var(--infinite-cell-color)',
          padding: '10px',
        }}
      >
        <button onClick={() => setWrapRowsHorizontally(!wrapRowsHorizontally)}>
          Toggle horizontal layout
        </button>
      </div>
      <TreeDataSource nodesKey="children" primaryKey="id" data={dataSource}>
        <TreeGrid
          columns={columns}
          wrapRowsHorizontally={wrapRowsHorizontally}
          columnDefaultWidth={100}
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
          extension: 'txt',
          mimeType: 'text/plain',
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
            {
              id: '311',
              name: 'WinterVacation.mp4',
              sizeInKB: 245,
              type: 'file',
              extension: 'mp4',
              mimeType: 'video/mp4',
            },
            {
              id: '312',
              name: 'SummerVacation.mp4',
              sizeInKB: 1259,
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
