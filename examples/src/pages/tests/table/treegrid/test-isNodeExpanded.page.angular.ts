import { Component, computed, signal } from '@angular/core';

import {
  TreeDataSource,
  TreeExpandState,
  TreeGrid,
} from '@infinite-table/infinite-angular';

type FileSystemNode = {
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemNode[] | null;
  sizeKB?: number;
  id: string;
  collapsed?: boolean;
};

const nodes: FileSystemNode[] = [
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

const columns: Record<string, any> = {
  name: {
    field: 'name',
    renderTreeIcon: true,

    renderValue: ({ value, data }: { value: any; data: FileSystemNode }) => {
      return `${value} - ${data!.id}`;
    },
  },
  type: { field: 'type' },
  sizeKB: { field: 'sizeKB' },
};

const treeExpandState = new TreeExpandState({
  defaultExpanded: false,
  expandedPaths: [['1', '4', '5'], ['1']],
});

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [TreeDataSource, TreeGrid],
  template: `
    <button (click)="expandAll()">expand all</button>
    <infinite-tree-data-source
      [data]="nodes"
      primaryKey="id"
      nodesKey="children"
      [treeExpandState]="treeExpandState"
      [onTreeExpandStateChange]="onTreeExpandStateChange"
      [isNodeExpanded]="isNodeExpanded()"
    >
      <infinite-tree-grid
        [wrapRowsHorizontally]="true"
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-tree-data-source>
  `,
})
export default class TestIsNodeExpandedPage {
  protected readonly nodes = nodes;
  protected readonly columns = columns;
  protected readonly treeExpandState = treeExpandState;
  protected readonly domProps = domProps;

  private readonly key = signal(0);

  protected readonly isNodeExpanded = computed(() => {
    // read key so the function identity changes when key changes
    this.key();
    return (rowInfo: any) => {
      return rowInfo.data.id === '3'
        ? false
        : treeExpandState.isNodeExpanded(rowInfo.nodePath);
    };
  });

  protected expandAll() {
    treeExpandState.expandAll();
    this.key.set(this.key() + 1);
  }

  protected readonly onTreeExpandStateChange = (treeExpandStateValue: any) => {
    treeExpandState.update(treeExpandStateValue);
    this.key.set(this.key() + 1);
  };
}
