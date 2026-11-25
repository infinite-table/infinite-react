import { Component, signal } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';

type FileSystemNode = {
  id: string;
  name: string;
  children?: FileSystemNode[];
};

const nodes: FileSystemNode[] = [
  {
    id: '1',
    name: 'Documents',
    children: [
      { id: '10', name: 'report.docx' },
      { id: '11', name: 'notes.txt' },
      {
        id: '12',
        name: 'Pictures',
        children: [
          { id: '120', name: 'beach.jpg' },
          { id: '121', name: 'mountain.png' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Desktop',
    children: [{ id: '20', name: 'todo.docx' }],
  },
];

const HIDDEN_IDS = ['11', '121'];

const treeFilterFunction = ({
  data,
  filterTreeNode,
}: {
  data: FileSystemNode;
  filterTreeNode: (data: FileSystemNode) => FileSystemNode | boolean;
}) => {
  if (!Array.isArray(data.children)) {
    return !HIDDEN_IDS.includes(data.id);
  }
  return filterTreeNode(data);
};

const columns: Record<string, any> = {
  name: {
    field: 'name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
  },
  id: { field: 'id' },
};

const domProps = {
  style: { height: '80vh' },
};

const target = signal<'all' | 'visible'>('all');
const filtered = signal(false);

(globalThis as any).setTarget = (value: 'all' | 'visible') => {
  target.set(value);
};
(globalThis as any).setFiltered = (value: boolean) => {
  filtered.set(value);
};

@Component({
  imports: [TreeDataSource, TreeGrid],
  template: `
    <infinite-tree-data-source
      [data]="nodes"
      primaryKey="id"
      selectionMode="multi-row"
      [multiRowSelectionTarget]="target()"
      [treeFilterFunction]="filtered() ? treeFilterFunction : undefined"
    >
      <infinite-tree-grid [domProps]="domProps" [columns]="columns" />
    </infinite-tree-data-source>
  `,
})
export default class SelectionTargetPage {
  protected readonly nodes = nodes;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly treeFilterFunction = treeFilterFunction;
  protected readonly target = target;
  protected readonly filtered = filtered;
}
