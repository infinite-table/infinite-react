import { Component } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';
import type { DataSourceApi } from '@infinite-table/infinite-angular';

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
      <div style="display: flex; gap: 10px; padding: 10px">
        <button (click)="addInitialData()">Add initial data</button>

        <button (click)="fail()">fail</button>
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
export default class InsertWaitFailPage {
  protected readonly emptyData = emptyData;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  private dataSourceApi: DataSourceApi<FileSystemNode> | null = null;

  protected onReady(api: DataSourceApi<FileSystemNode>) {
    this.dataSourceApi = api;
  }

  protected addInitialData() {
    this.dataSourceApi?.addDataArray(dataSource());
  }

  protected fail() {
    if (!this.dataSourceApi) {
      return;
    }

    this.dataSourceApi.updateChildrenByNodePath(
      (children: FileSystemNode[] | null | undefined) => {
        return [
          ...(children ?? []),
          {
            id: '20',
            hierarchyPosition: 1,
            name: 'unknown.txt',
            sizeInKB: 100,
            type: 'file' as const,
          },
        ];
      },
      ['2'],
    );
  }
}
