import { Component, signal } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';

import type {
  DataSourceApi,
  InfiniteTableColumn,
  TreeExpandStateValue,
} from '@infinite-table/infinite-angular';

import { FileSystemNode, nodes } from './nodes';

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: { field: 'name', header: 'Name 0', renderTreeIcon: true },
  type: { field: 'type', header: 'Type 1' },
  extension: { field: 'extension', header: 'Extension 2' },
  mimeType: { field: 'mimeType', header: 'Mime Type 3' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB) 4' },
  lastModified: { field: 'lastModified', header: 'Last Modified 5' },
  owner: { field: 'owner', header: 'Owner 6' },
  permissions: { field: 'permissions', header: 'Permissions 7' },
};

const dataSource = () => {
  return Promise.resolve(nodes);
};

@Component({
  imports: [TreeDataSource, TreeGrid],
  template: `
    <infinite-tree-data-source
      (ready)="onReady($event)"
      nodesKey="children"
      primaryKey="id"
      [data]="dataSource"
      [defaultTreeExpandState]="defaultTreeExpandState"
    >
      <div style="color: var(--infinite-cell-color); padding: 10px">
        <button
          class="bg-blue-500 p-1 m-1 text-white rounded-sm"
          (click)="dataSourceApi()?.treeApi?.expandAll()"
        >
          Expand all
        </button>
        <button
          class="bg-blue-500 p-1 m-1 text-white rounded-sm"
          (click)="dataSourceApi()?.treeApi?.collapseAll()"
        >
          Collapse all
        </button>
      </div>

      <infinite-tree-grid [columns]="columns" [domProps]="domProps" />
    </infinite-tree-data-source>
  `,
})
export default class TreeDemo2Page {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = {
    style: {
      height: '1068px',
      width: '500px',
    },
  };

  protected readonly dataSourceApi =
    signal<DataSourceApi<FileSystemNode> | null>(null);

  protected readonly defaultTreeExpandState: TreeExpandStateValue = {
    defaultExpanded: false,
    expandedPaths: [],
  };

  protected onReady(api: DataSourceApi<FileSystemNode>) {
    this.dataSourceApi.set(api);
  }
}
