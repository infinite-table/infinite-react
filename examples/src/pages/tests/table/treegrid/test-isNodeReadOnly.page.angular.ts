import { Component, computed, signal } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';

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
        name: 'pictures - empty',
        id: '3',
        children: [],
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

const returnFalse = () => false;

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
    <button (click)="toggle()">toggle</button>
    <infinite-tree-data-source
      [data]="nodes"
      primaryKey="id"
      nodesKey="children"
      [isNodeReadOnly]="isNodeReadOnly()"
    >
      <infinite-tree-grid
        [wrapRowsHorizontally]="true"
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-tree-data-source>
  `,
})
export default class TestIsNodeReadOnlyPage {
  protected readonly nodes = nodes;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  private readonly allowExpandEmptyNodes = signal(false);

  protected readonly isNodeReadOnly = computed(() =>
    this.allowExpandEmptyNodes() ? returnFalse : undefined,
  );

  protected toggle() {
    this.allowExpandEmptyNodes.set(!this.allowExpandEmptyNodes());
  }
}
