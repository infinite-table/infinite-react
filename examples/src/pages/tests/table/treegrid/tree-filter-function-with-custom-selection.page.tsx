import * as React from 'react';

import {
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
  TreeSelectionValue,
  withSelectedLeafNodesOnly,
} from '@infinite-table/infinite-react';

import { useCallback, useState } from 'react';

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
      { name: 'timetable.xls', type: 'file', sizeKB: 10, id: '2' },
      {
        name: 'resume.ppt',
        type: 'file',
        sizeKB: 100,
        id: '3',
      },
      {
        type: 'folder',
        name: 'pictures',
        id: '4',
        children: [
          {
            name: 'beach.jpg',
            type: 'file',
            sizeKB: 2024,
            id: '5',
          },
          {
            name: 'mountain.jpg',
            type: 'file',
            sizeKB: 302,
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
  {
    type: 'folder',
    name: 'Downloads',
    id: '8',
    collapsed: true,
    children: [
      {
        name: 'resume.doc',
        type: 'file',
        sizeKB: 5034,
        id: '9',
      },
      {
        name: 'resume.pdf',
        type: 'file',
        sizeKB: 1000,
        id: '10',
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
  const [filter, setFilter] = useState('');

  const [treeSelection, setTreeSelection] = useState<TreeSelectionValue>({
    defaultSelection: false,
    selectedPaths: [],
  });

  (globalThis as any).treeSelection = treeSelection;

  const nodeMatches = useCallback(
    ({ data }: { data: FileSystemNode }) => {
      return !filter
        ? data
        : data.name.toLowerCase().includes(filter.toLowerCase());
    },
    [filter],
  );
  const filterFunction = useCallback(
    ({
      data,
      filterTreeNode,
    }: {
      data: FileSystemNode;
      filterTreeNode: (data: FileSystemNode) => FileSystemNode | boolean;
    }) => {
      if (!Array.isArray(data.children)) {
        return nodeMatches({ data });
      }

      return filterTreeNode(data);
    },
    [nodeMatches],
  );
  return (
    <React.StrictMode>
      <input
        type="text"
        name="filter"
        className="border border-black p-2 m-1"
        placeholder="Type to filter"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <TreeDataSource<FileSystemNode>
        data={nodes}
        primaryKey="id"
        selectionMode="multi-row"
        treeSelection={treeSelection}
        onTreeSelectionChange={withSelectedLeafNodesOnly(setTreeSelection)}
        treeFilterFunction={filterFunction}
        defaultTreeExpandState={{
          defaultExpanded: true,
          collapsedPaths: [],
        }}
      >
        <TreeGrid<FileSystemNode>
          wrapRowsHorizontally
          editable={() => true}
          columnDefaultWidth={300}
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
