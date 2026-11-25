import { Component, TemplateRef, viewChild } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';
import type {
  DataSourceApi,
  InfiniteTableColumn,
  InfiniteTableProps,
} from '@infinite-table/infinite-angular';

import { type FileSystemNode, dataSource } from './data';

const fileIds = [
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '110',
  '111',
  '112',
  '113',
  '114',
  '115',
  '116',
  '117',
  '118',
  '119',
  '20',
  '21',
  '22',
  '23',
];

const domProps: InfiniteTableProps<FileSystemNode>['domProps'] = {
  style: {
    flex: 1,
  },
};

@Component({
  imports: [TreeDataSource, TreeGrid],
  template: `
    <div
      style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 8px"
    >
      <button (click)="updateCell()" style="padding: 8px 16px">
        Update Cell
      </button>
      <infinite-tree-data-source
        nodesKey="children"
        primaryKey="id"
        [data]="dataSource"
        (ready)="onReady($event)"
      >
        <infinite-tree-grid
          [columns]="columns"
          wrapRowsHorizontally
          [domProps]="domProps"
        />
      </infinite-tree-data-source>
    </div>

    <ng-template #typeCell let-value>
      <span
        style="padding: 2px 8px; border-radius: 4px; font-size: 12px"
        [style.background-color]="value === 'folder' ? '#1e3a8a' : '#374151'"
        [style.color]="value === 'folder' ? '#93c5fd' : '#9ca3af'"
        >{{ value }}</span
      >
    </ng-template>

    <ng-template #extensionCell let-value>
      <span style="font-family: monospace; color: #34d399; font-weight: 500"
        >.{{ value }}</span
      >
    </ng-template>

    <ng-template #mimeTypeCell let-value>
      <span style="font-size: 11px; color: #9ca3af; font-style: italic">{{
        value
      }}</span>
    </ng-template>

    <ng-template #sizeCell let-value>
      <span
        style="font-weight: 600"
        [style.color]="
          value > 1000 ? '#f87171' : value > 500 ? '#fbbf24' : '#4ade80'
        "
        >{{ value.toLocaleString() }}</span
      >
    </ng-template>
  `,
})
export default class PerfFlashingPage {
  protected readonly dataSource = dataSource;
  protected readonly domProps = domProps;

  private readonly typeCell =
    viewChild.required<TemplateRef<unknown>>('typeCell');
  private readonly extensionCell =
    viewChild.required<TemplateRef<unknown>>('extensionCell');
  private readonly mimeTypeCell =
    viewChild.required<TemplateRef<unknown>>('mimeTypeCell');
  private readonly sizeCell =
    viewChild.required<TemplateRef<unknown>>('sizeCell');

  protected readonly columns: Record<
    string,
    InfiniteTableColumn<FileSystemNode>
  > = {
    name: {
      field: 'name',
      renderTreeIcon: true,
      header: 'Name',
      style: ({ data }) => ({
        fontWeight: data?.type === 'folder' ? 'bold' : 'normal',
        color: data?.type === 'folder' ? '#60a5fa' : '#d1d5db',
      }),
    },
    type: {
      field: 'type',
      header: 'Type',
      render: () => this.typeCell(),
    },
    extension: {
      field: 'extension',
      header: 'Extension',
      render: ({ value }) => (value ? this.extensionCell() : null),
    },
    mimeType: {
      field: 'mimeType',
      header: 'Mime Type',
      render: ({ value }) => (value ? this.mimeTypeCell() : null),
    },
    size: {
      field: 'sizeInKB',
      type: 'number',
      header: 'Size (KB)',
      render: () => this.sizeCell(),
    },
  };

  private api: DataSourceApi<FileSystemNode> | null = null;

  protected onReady(api: DataSourceApi<FileSystemNode>) {
    this.api = api;
  }

  protected updateCell() {
    const randomId = fileIds[Math.floor(Math.random() * fileIds.length)];
    this.api?.updateData({
      id: randomId,
      sizeInKB: Math.floor(Math.random() * 1000),
    });
  }
}
