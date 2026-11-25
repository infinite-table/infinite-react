import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  TreeDataSource,
  TreeGrid,
  type DataSourceApi,
  type InfiniteTablePropColumns,
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
        collapsed: true,
        children: [
          {
            name: 'mountain.jpg',
            type: 'file',
            sizeKB: 302,
            id: '5',
          },
          {
            name: 'mountain2.jpg',
            type: 'file',
            sizeKB: 352,
            id: '6',
          },
        ],
      },
      {
        type: 'folder',
        name: 'misc',
        id: '4',
        collapsed: true,
        children: [
          {
            name: 'beach.jpg',
            type: 'file',
            sizeKB: 2024,
            id: '7',
          },
        ],
      },
      {
        type: 'file',
        name: 'last.txt',
        id: '8',
      },
    ],
  },
];

const columns: InfiniteTablePropColumns<FileSystemNode> = {
  name: {
    field: 'name',
    defaultWidth: 300,
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
    <button (click)="selectAll()">Select all</button>
    <infinite-tree-data-source
      (ready)="onReady($event)"
      [data]="nodes"
      primaryKey="id"
      nodesKey="children"
      [defaultTreeSelection]="defaultTreeSelection"
    >
      <infinite-tree-grid
        wrapRowsHorizontally
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-tree-data-source>
  `,
})
export default class SelectionApiPage {
  protected readonly nodes = nodes;
  protected readonly columns = columns;

  private dataSourceApi: DataSourceApi<FileSystemNode> | null = null;

  protected onReady(api: DataSourceApi<FileSystemNode>) {
    this.dataSourceApi = api;
  }

  protected selectAll() {
    this.dataSourceApi!.treeApi.selectAll();
  }

  protected readonly defaultTreeSelection = {
    defaultSelection: true as const,
    deselectedPaths: [['1', '3']],
    selectedPaths: [['1', '3', '6']],
  };

  protected readonly domProps = {
    style: {
      margin: '5px',
      height: '900px',
      border: '1px solid gray',
      position: 'relative' as const,
    },
  };
}
