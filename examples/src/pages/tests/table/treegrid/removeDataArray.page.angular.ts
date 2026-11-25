import { Component } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';
import type { DataSourceApi } from '@infinite-table/infinite-angular';

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
    <button type="button" (click)="removeRowsByPrimaryKey()">
      Click to removeRowsByPrimaryKey
    </button>
    <button type="button" (click)="removeRowsByDataRow()">
      Click to removeRowsByDataRow
    </button>
    <button type="button" (click)="removeById()">
      Click to remove one by id
    </button>
    <infinite-tree-data-source
      (ready)="onReady($event)"
      [data]="nodes"
      primaryKey="id"
      nodesKey="children"
    >
      <infinite-tree-grid [domProps]="domProps" [columns]="columns" />
    </infinite-tree-data-source>
  `,
})
export default class TreeRemoveDataArrayPage {
  protected readonly nodes = nodes;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  private dataSourceApi: DataSourceApi<FileSystemNode> | null = null;

  protected onReady(api: DataSourceApi<FileSystemNode>) {
    this.dataSourceApi = api;
  }

  protected async removeRowsByPrimaryKey() {
    const dataSourceApi = this.dataSourceApi;
    if (!dataSourceApi) {
      return;
    }
    const getAllData = dataSourceApi.getRowInfoArray();
    console.log('data source before remove', getAllData);

    const listOfPrimaryKeys = getAllData.map((row: any) => row.data.id);
    console.log('listOfPrimaryKeys', listOfPrimaryKeys);

    await dataSourceApi.removeDataArrayByPrimaryKeys(listOfPrimaryKeys);
    console.log('data source after remove', dataSourceApi.getRowInfoArray());
  }

  protected async removeRowsByDataRow() {
    const dataSourceApi = this.dataSourceApi;
    if (!dataSourceApi) {
      return;
    }
    const getAllData = dataSourceApi.getRowInfoArray();
    console.log('data source before remove', getAllData);

    const listOfRows = getAllData.map((row: any) => row.data);
    console.log('listOfRows', listOfRows);
    await dataSourceApi.removeDataArray(listOfRows);
    console.log('data source after remove', dataSourceApi.getRowInfoArray());
  }

  protected async removeById() {
    if (!this.dataSourceApi) {
      return;
    }
    await this.dataSourceApi.removeDataByPrimaryKey('3');
  }
}
