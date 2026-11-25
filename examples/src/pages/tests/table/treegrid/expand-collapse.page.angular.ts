import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import {
  TreeDataSource,
  TreeGrid,
  type InfiniteTablePropColumns,
  type TreeExpandStateValue,
  type TreeSelectionValue,
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

const columns: InfiniteTablePropColumns<FileSystemNode> = {
  name: {
    field: 'name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
    renderValue: ({ value, data }) => `${value} - ${data!.id}`,
  },
  type: { field: 'type' },
  sizeKB: { field: 'sizeKB' },
};

@Component({
  selector: 'test-page',
  imports: [TreeDataSource, TreeGrid],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <infinite-tree-data-source
      [data]="nodes"
      primaryKey="id"
      nodesKey="children"
      selectionMode="multi-row"
      [(treeSelection)]="treeSelection"
      [(treeExpandState)]="treeExpandState"
    >
      <infinite-tree-grid
        wrapRowsHorizontally
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-tree-data-source>
  `,
})
export default class ExpandCollapsePage {
  protected readonly nodes = nodes;
  protected readonly columns = columns;

  protected readonly treeSelection = signal<TreeSelectionValue>({
    defaultSelection: false,
    selectedPaths: [
      ['1', '4', '5'],
      ['1', '3'],
    ],
  });

  protected readonly treeExpandState = signal<TreeExpandStateValue>({
    defaultExpanded: true,
    collapsedPaths: [],
  });

  protected readonly domProps = {
    style: {
      margin: '5px',
      height: '900px',
      border: '1px solid gray',
      position: 'relative' as const,
    },
  };
}
