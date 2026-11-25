import { Component } from '@angular/core';

import {
  TreeDataSource,
  TreeGrid,
  multisortNested,
} from '@infinite-table/infinite-angular';
import type {
  DataSourceSingleSortInfo,
  InfiniteTableColumn,
} from '@infinite-table/infinite-angular';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  sizeInKB: number;
  children?: FileSystemNode[];
};

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: { field: 'name', header: 'Name', renderTreeIcon: true },
  type: { field: 'type', header: 'Type' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
};

const defaultSortInfo: DataSourceSingleSortInfo<FileSystemNode> = {
  field: 'sizeInKB',
  dir: -1,
};

// the sortFunction only gets the top-level nodes - so it calls
// multisortNested, which sorts every level of the tree
function sortFunction(
  sortInfo: DataSourceSingleSortInfo<FileSystemNode>[],
  nodes: FileSystemNode[],
) {
  // folders first, then the sorting the user picked
  const folderFirst = {
    dir: 1 as const,
    valueGetter: (node: FileSystemNode) => (node.type === 'folder' ? 0 : 1),
    type: 'number',
  };

  return multisortNested([folderFirst, ...sortInfo], nodes, {
    nodesKey: 'children',
    toKey: (node) => node.id,
  });
}

const nodes: FileSystemNode[] = [
  {
    id: '1',
    name: 'Documents',
    sizeInKB: 1200,
    type: 'folder',
    children: [
      { id: '10', name: 'Report.docx', sizeInKB: 210, type: 'file' },
      { id: '11', name: 'Vacation.docx', sizeInKB: 120, type: 'file' },
      {
        id: '12',
        name: 'Archive',
        sizeInKB: 600,
        type: 'folder',
        children: [
          { id: '120', name: '2023.zip', sizeInKB: 400, type: 'file' },
          { id: '121', name: '2024.zip', sizeInKB: 200, type: 'file' },
        ],
      },
    ],
  },
  { id: '2', name: 'notes.txt', sizeInKB: 2, type: 'file' },
  {
    id: '3',
    name: 'Pictures',
    sizeInKB: 3000,
    type: 'folder',
    children: [
      { id: '30', name: 'beach.png', sizeInKB: 1800, type: 'file' },
      { id: '31', name: 'mountain.png', sizeInKB: 1200, type: 'file' },
    ],
  },
  { id: '4', name: 'todo.md', sizeInKB: 5, type: 'file' },
];

@Component({
  selector: 'demo-root',
  imports: [TreeDataSource, TreeGrid],
  template: `
    <infinite-tree-data-source
      nodesKey="children"
      primaryKey="id"
      [data]="nodes"
      [defaultSortInfo]="defaultSortInfo"
      [sortFunction]="sortFunction"
    >
      <infinite-tree-grid [columns]="columns" />
    </infinite-tree-data-source>
  `,
})
export default class App {
  protected readonly nodes = nodes;
  protected readonly columns = columns;
  protected readonly defaultSortInfo = defaultSortInfo;
  protected readonly sortFunction = sortFunction;
}
