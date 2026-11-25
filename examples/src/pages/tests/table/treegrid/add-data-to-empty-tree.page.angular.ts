import { Component } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';
import type { DataSourceApi } from '@infinite-table/infinite-angular';

import { nodes } from './default.data';
import type { FileSystemNode } from './default.data';

const columns: Record<string, any> = {
  name: {
    field: 'name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
    renderValue: ({ value, data }: { value: any; data: FileSystemNode }) => {
      return `${value} - ${data!.id}`;
    },
  },
  type: { field: 'type' },
  sizeKB: { field: 'sizeKB' },
};

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const emptyData: FileSystemNode[] = [];

@Component({
  imports: [TreeDataSource, TreeGrid],
  template: `
    <button (click)="addData()">Add data</button>
    <infinite-tree-data-source
      (ready)="onReady($event)"
      [data]="emptyData"
      primaryKey="id"
      nodesKey="children"
    >
      <infinite-tree-grid
        [wrapRowsHorizontally]="true"
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-tree-data-source>
  `,
})
export default class AddDataToEmptyTreePage {
  protected readonly emptyData = emptyData;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  private times = 0;

  private dataSourceApi: DataSourceApi<FileSystemNode> | null = null;

  protected onReady(api: DataSourceApi<FileSystemNode>) {
    this.dataSourceApi = api;
  }

  protected addData() {
    if (this.times === 0) {
      this.dataSourceApi!.addDataArray([nodes[0]]);
    } else {
      this.dataSourceApi!.addDataArray([
        {
          id: `inserted - ${this.times}`,
          name: `${this.times}`,
          type: 'file',
          sizeKB: 100,
        },
      ]);
    }
    this.times++;
  }
}
