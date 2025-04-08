import * as React from 'react';

import {
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';

export type FileSystemNode = {
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemNode[] | null;
  sizeKB?: number;
  id: string;
  collapsed?: boolean;
};

export const nodes: FileSystemNode[] = [
  {
    name: 'Documents',
    type: 'folder',
    id: '1',
    children: [
      { name: 'timetable.xls', type: 'file', sizeKB: 15, id: '2' },
      { name: 'report.doc', type: 'file', sizeKB: 220, id: '3' },
      {
        type: 'folder',
        name: 'Pictures',
        id: '4',
        children: [
          { name: 'beach.jpg', type: 'file', sizeKB: 1800, id: '5' },
          { name: 'mountain.jpg', type: 'file', sizeKB: 2500, id: '6' },
          { name: 'family.png', type: 'file', sizeKB: 3200, id: '7' },
        ],
      },
      { name: 'budget.xlsx', type: 'file', sizeKB: 30, id: '8' },
    ],
  },
  {
    type: 'folder',
    name: 'Downloads',
    id: '9',
    children: [
      { name: 'resume.pdf', type: 'file', sizeKB: 45, id: '10' },
      { name: 'movie.mp4', type: 'file', sizeKB: 8500000, id: '11' },
      {
        type: 'folder',
        name: 'Software',
        id: '12',
        children: [
          { name: 'app_installer.exe', type: 'file', sizeKB: 250000, id: '13' },
          { name: 'update.zip', type: 'file', sizeKB: 30000, id: '14' },
        ],
      },
    ],
  },
  {
    type: 'folder',
    name: 'Music',
    id: '15',
    children: [
      { name: 'song1.mp3', type: 'file', sizeKB: 5000, id: '16' },
      { name: 'song2.mp3', type: 'file', sizeKB: 4800, id: '17' },
      { name: 'playlist.m3u', type: 'file', sizeKB: 1, id: '18' },
    ],
  },
  {
    type: 'folder',
    name: 'Projects',
    id: '19',
    children: [
      {
        type: 'folder',
        name: 'Website',
        id: '20',
        children: [
          { name: 'index.html', type: 'file', sizeKB: 5, id: '21' },
          { name: 'styles.css', type: 'file', sizeKB: 10, id: '22' },
          { name: 'script.js', type: 'file', sizeKB: 8, id: '23' },
        ],
      },
    ],
  },
];

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

export default function DataTestPage() {
  const [wrapRowsHorizontally, setWrapRowsHorizontally] = React.useState(true);
  return (
    <React.StrictMode>
      <button
        onClick={() => {
          setWrapRowsHorizontally(!wrapRowsHorizontally);
        }}
      >
        toggle horizontal layout
      </button>
      <TreeDataSource<FileSystemNode>
        data={nodes}
        primaryKey="id"
        nodesKey="children"
        selectionMode="multi-row"
        defaultTreeSelection={{
          defaultSelection: false,
          selectedPaths: [
            ['1', '4', '5'],
            ['1', '3'],
          ],
        }}
        defaultTreeExpandState={{
          defaultExpanded: true,
          collapsedPaths: [['8'], ['1', '4']],
        }}
      >
        <TreeGrid<FileSystemNode>
          wrapRowsHorizontally={wrapRowsHorizontally}
          repeatWrappedGroupRows={(rowInfo) => {
            if (!rowInfo.isTreeNode) {
              return false;
            }
            return rowInfo.nodePath.length === 1;
          }}
          domProps={{
            style: {
              margin: '5px',
              height: '70vh',
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
