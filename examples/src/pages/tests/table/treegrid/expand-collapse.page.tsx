import * as React from 'react';

import {
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
  TreeSelectionValue,
} from '@infinite-table/infinite-react';
import { useState } from 'react';
import { TreeExpandStateValue } from '@infinite-table/infinite-react';

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
  const [treeSelectionState, setTreeSelectionState] =
    useState<TreeSelectionValue>({
      defaultSelection: false,
      selectedPaths: [
        ['1', '4', '5'],
        ['1', '3'],
      ],
    });
  const [treeExpandState, setTreeExpandState] = useState<TreeExpandStateValue>({
    defaultExpanded: true,
    collapsedPaths: [],
  });
  return (
    <React.StrictMode>
      <TreeDataSource<FileSystemNode>
        data={nodes}
        primaryKey="id"
        nodesKey="children"
        selectionMode="multi-row"
        treeSelection={treeSelectionState}
        onTreeSelectionChange={setTreeSelectionState}
        treeExpandState={treeExpandState}
        onTreeExpandStateChange={(expandState) => {
          console.log('expandState', expandState);
          // console.log(expandState.collapsedPaths)
          setTreeExpandState(expandState);
        }}
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
