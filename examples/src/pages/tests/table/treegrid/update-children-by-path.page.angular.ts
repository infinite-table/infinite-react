import { Component } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  mimeType?: string;
  sizeInKB: number;
  hierarchyPosition: number;
  children?: FileSystemNode[];
};

const columns: Record<string, any> = {
  name: {
    field: 'name',
    header: 'Name',
    renderTreeIcon: true,
    renderValue: ({ value, data }: { value: any; data: FileSystemNode }) => {
      return `${value} - ${data!.id}`;
    },
  },
  type: { field: 'type', header: 'Type' },
  extension: { field: 'extension', header: 'Extension' },
  mimeType: { field: 'mimeType', header: 'Mime Type' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
};

const dataSource = () => {
  const nodes: FileSystemNode[] = [
    {
      id: '1',
      name: 'Documents',
      sizeInKB: 1200,
      type: 'folder',
      hierarchyPosition: 1,
      children: [
        {
          id: '10',
          name: 'Private',
          hierarchyPosition: 7,
          sizeInKB: 100,
          type: 'folder',
          children: undefined,
        },
        {
          id: '11',
          name: 'Public',
          hierarchyPosition: 2,
          sizeInKB: 100,
          type: 'folder',
          children: undefined,
        },
        {
          id: '12',
          name: 'Protected',
          hierarchyPosition: 0,
          sizeInKB: 100,
          type: 'folder',
          children: undefined,
        },
      ],
    },
    {
      id: '2',
      name: 'Desktop',
      sizeInKB: 1000,
      type: 'folder',
      hierarchyPosition: 0,
      children: [
        {
          id: '20',
          hierarchyPosition: 1,
          name: 'unknown.txt',
          sizeInKB: 100,
          type: 'file',
        },
        {
          id: '201',
          name: 'test.txt',
          type: 'file',
          hierarchyPosition: 0,
          sizeInKB: 123512,
        },
      ],
    },
  ];
  return nodes;
};

const emptyData: FileSystemNode[] = [];

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
    <div style="color: var(--infinite-cell-color); padding: 10px">
      <div>Use the buttons below to update the current active node.</div>
      <div style="display: flex; gap: 10px; padding: 10px">
        <button (click)="addInitialData()">Add initial data</button>

        <button (click)="addMoreData()">Add more data</button>

        <button (click)="clickLast()">click last</button>
      </div>
    </div>
    <infinite-tree-data-source
      nodesKey="children"
      primaryKey="id"
      [data]="emptyData"
      (ready)="onReady($event)"
    >
      <infinite-tree-grid [columns]="columns" [domProps]="domProps" />
    </infinite-tree-data-source>
  `,
})
export default class UpdateChildrenByPathPage {
  protected readonly emptyData = emptyData;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  private dataSourceApi: any | null = null;

  protected onReady(api: any) {
    this.dataSourceApi = api;
  }

  protected addInitialData() {
    this.dataSourceApi?.addDataArray(dataSource());
  }

  protected addMoreData() {
    if (!this.dataSourceApi) {
      return;
    }

    this.dataSourceApi.updateChildrenByNodePath(
      (currentChildren: any) => {
        return [
          ...(currentChildren || []),
          {
            name: 'New Child',
            type: 'file',
            hierarchyPosition: 1,
            sizeInKB: 1234,
            id: '8',
          },
        ];
      },
      ['1', '10'],
    );
  }

  protected clickLast() {
    if (!this.dataSourceApi) {
      return;
    }
    this.dataSourceApi.insertData(
      {
        id: '777',
        name: 'inserted',
        type: 'folder',
        children: [
          {
            id: '7777',
            name: 'child of inserted',
            type: 'file',
          },
        ],
      },
      { position: 'after', primaryKey: '12' },
    );
  }
}
