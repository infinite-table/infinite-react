import { Component } from '@angular/core';

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

const isNodeReadOnly = (rowInfo: any) => rowInfo.data.id === '1';

const defaultTreeExpandState = {
  defaultExpanded: true as const,
  collapsedPaths: [['1']],
};

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
    <infinite-tree-data-source
      [data]="nodes"
      primaryKey="id"
      [isNodeReadOnly]="isNodeReadOnly"
      [defaultTreeExpandState]="defaultTreeExpandState"
    >
      <infinite-tree-grid [domProps]="domProps" [columns]="columns" />
    </infinite-tree-data-source>
  `,
})
export default class IsNodeReadOnlyPage {
  protected readonly nodes = nodes;
  protected readonly columns = columns;
  protected readonly isNodeReadOnly = isNodeReadOnly;
  protected readonly defaultTreeExpandState = defaultTreeExpandState;
  protected readonly domProps = domProps;
}
