import * as React from 'react';

import {
  DataSourcePropIsNodeExpanded,
  InfiniteTableColumn,
  TreeDataSource,
  TreeExpandState,
  TreeGrid,
} from '@infinite-table/infinite-react';
import { useState } from 'react';

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
        type: 'folder',
        name: 'diverse',
        id: '4',
        children: [
          {
            name: 'beach.jpg',
            type: 'file',
            sizeKB: 2024,
            id: '6',
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

export default function DataTestPage() {
  const [treeExpandState] = useState<TreeExpandState>(() => {
    return new TreeExpandState({
      defaultExpanded: false,
      expandedPaths: [['1', '4', '5'], ['1']],
    });
  });
  const [key, setKey] = useState(0);
  const isNodeExpanded = React.useCallback<
    DataSourcePropIsNodeExpanded<FileSystemNode>
  >(
    (rowInfo) => {
      return rowInfo.data.id === '3'
        ? false
        : treeExpandState.isNodeExpanded(rowInfo.nodePath);
    },
    [key],
  );

  return (
    <React.StrictMode>
      <button
        onClick={() => {
          treeExpandState.expandAll();
          setKey((k) => k + 1);
        }}
      >
        expand all
      </button>
      <TreeDataSource<FileSystemNode>
        data={nodes}
        primaryKey="id"
        nodesKey="children"
        treeExpandState={treeExpandState}
        onTreeExpandStateChange={(treeExpandStateValue) => {
          treeExpandState.update(treeExpandStateValue);
          setKey((k) => k + 1);
        }}
        isNodeExpanded={isNodeExpanded}
      >
        <TreeGrid<FileSystemNode>
          wrapRowsHorizontally
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
    </React.StrictMode>
  );
}
