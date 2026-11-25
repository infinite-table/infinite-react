import { Component, TemplateRef, viewChild } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';
import type {
  DataSourceApi,
  TreeSelectionValue,
} from '@infinite-table/infinite-angular';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  mimeType?: string;
  sizeInKB: number;
  children?: FileSystemNode[];
};

const defaultTreeSelection: TreeSelectionValue = {
  defaultSelection: true,
  deselectedPaths: [
    ['1', '10'],
    ['3', '31'],
  ],
  selectedPaths: [['3']],
};

const dataSource = () => {
  const nodes: FileSystemNode[] = [
    {
      id: '1',
      name: 'Documents',
      sizeInKB: 1200,
      type: 'folder',
      children: [
        {
          id: '10',
          name: 'Private',
          sizeInKB: 100,
          type: 'folder',
          children: [
            {
              id: '100',
              name: 'Report.docx',
              sizeInKB: 210,
              type: 'file',
              extension: 'docx',
              mimeType: 'application/msword',
            },
            {
              id: '101',
              name: 'Vacation.docx',
              sizeInKB: 120,
              type: 'file',
              extension: 'docx',
              mimeType: 'application/msword',
            },
            {
              id: '102',
              name: 'CV.pdf',
              sizeInKB: 108,
              type: 'file',
              extension: 'pdf',
              mimeType: 'application/pdf',
            },
          ],
        },
      ],
    },
    {
      id: '2',
      name: 'Desktop',
      sizeInKB: 1000,
      type: 'folder',
      children: [
        {
          id: '20',
          name: 'unknown.txt',
          sizeInKB: 100,
          type: 'file',
        },
      ],
    },
    {
      id: '3',
      name: 'Media',
      sizeInKB: 1000,
      type: 'folder',
      children: [
        {
          id: '30',
          name: 'Music - empty',
          sizeInKB: 0,
          type: 'folder',
          children: [],
        },
        {
          id: '31',
          name: 'Videos',
          sizeInKB: 5400,
          type: 'folder',
          children: [
            {
              id: '310',
              name: 'Vacation.mp4',
              sizeInKB: 108,
              type: 'file',
              extension: 'mp4',
              mimeType: 'video/mp4',
            },
          ],
        },
      ],
    },
  ];
  return Promise.resolve(nodes);
};

const domProps = { style: { height: '100%' } };

@Component({
  imports: [TreeDataSource, TreeGrid],
  template: `
    <infinite-tree-data-source
      (ready)="onReady($event)"
      nodesKey="children"
      primaryKey="id"
      [data]="dataSource"
      [defaultTreeSelection]="defaultTreeSelection"
    >
      <div
        style="color: var(--infinite-cell-color); padding: 10px; display: flex; gap: 10px"
      >
        <button (click)="selectAll()">Select all</button>
        <button (click)="deselectAll()">Deselect all</button>
      </div>

      <infinite-tree-grid [columns]="columns" [domProps]="domProps" />
    </infinite-tree-data-source>

    <ng-template #nameValue let-value let-rowInfo="rowInfo">
      <div style="color: red; display: inline-block">
        {{ rowInfo.id }} - {{ value }}
      </div>
    </ng-template>
  `,
})
export default class Selection2Page {
  protected readonly dataSource = dataSource;
  protected readonly defaultTreeSelection = defaultTreeSelection;
  protected readonly domProps = domProps;

  private readonly nameValue =
    viewChild.required<TemplateRef<unknown>>('nameValue');

  protected readonly columns: Record<string, any> = {
    name: {
      field: 'name',
      header: 'Name',
      defaultWidth: 500,
      // the template gets the value and the render params (rowInfo, ...)
      renderValue: () => this.nameValue(),
      renderTreeIcon: true,
      renderSelectionCheckBox: true,
    },
    type: { field: 'type', header: 'Type' },
    extension: { field: 'extension', header: 'Extension' },
    mimeType: { field: 'mimeType', header: 'Mime Type' },
    size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
  };

  private dataSourceApi: DataSourceApi<FileSystemNode> | null = null;

  protected onReady(api: DataSourceApi<FileSystemNode>) {
    this.dataSourceApi = api;
  }

  protected selectAll() {
    this.dataSourceApi!.treeApi.selectAll();
  }

  protected deselectAll() {
    this.dataSourceApi!.treeApi.deselectAll();
  }
}
