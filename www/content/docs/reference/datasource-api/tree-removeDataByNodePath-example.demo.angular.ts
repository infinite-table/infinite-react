import { Component, signal } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';
import type {
  DataSourceApi,
  InfiniteTableColumn,
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

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: { field: 'name', header: 'Name', renderTreeIcon: true },
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

let times = 0;
const getRandomFileName = () => {
  const names = [
    'Report',
    'Vacation',
    'CV',
    'Unknown',
    'Sales.jpg',
    'Finances.xls',
    'Presentation.ppt',
    'Budget.xlsx',
    'Notes.txt',
    'Resume.docx',
    'Agenda.docx',
    'Summary.docx',
    'Proposal.docx',
    'Report.docx',
    'Invoice.pdf',
    'Memo.docx',
    'Letter.docx',
    'Plan.docx',
    'Guide.docx',
  ];
  const name = names[Math.floor(Math.random() * names.length)];
  const [namePart, extension] = name.split('.');
  times++;
  return `${namePart}${times}${extension ? `.${extension}` : ''}`;
};

@Component({
  selector: 'demo-root',
  imports: [TreeDataSource, TreeGrid],
  template: `
    <div style="color: var(--infinite-cell-color); padding: 10px">
      <div>Use the buttons below to update the current active node.</div>
      <div style="display: flex; gap: 10px; padding: 10px">
        <button (click)="updateCurrentNode()">Update current node</button>
        <button (click)="removeChildren()">
          Remove children for current node
        </button>
        <button (click)="removeCurrentNode()">Remove current node</button>
      </div>
    </div>
    <infinite-tree-data-source
      nodesKey="children"
      primaryKey="id"
      [data]="dataSource"
      (ready)="setDataSourceApi($event)"
    >
      <infinite-tree-grid [columns]="columns" [(activeRowIndex)]="activeIndex" />
    </infinite-tree-data-source>
  `,
})
export default class App {
  protected readonly columns = columns;
  protected readonly dataSource = dataSource;

  private dataSourceApi: DataSourceApi<FileSystemNode> | null = null;
  protected readonly activeIndex = signal<number | null | undefined>(0);

  protected setDataSourceApi(api: DataSourceApi<FileSystemNode>) {
    this.dataSourceApi = api;
  }

  private getActiveTreeNode() {
    const activeIndex = this.activeIndex();
    if (activeIndex == null) {
      return null;
    }
    const rowInfo = this.dataSourceApi?.getRowInfoByIndex(activeIndex);
    if (!rowInfo || !rowInfo.isTreeNode) {
      return null;
    }
    return rowInfo;
  }

  protected updateCurrentNode() {
    const rowInfo = this.getActiveTreeNode();
    if (!rowInfo) {
      return;
    }
    const randomSize = Math.floor(Math.random() * 10000) + 1;

    this.dataSourceApi!.updateDataByNodePath(
      { sizeInKB: randomSize, name: getRandomFileName() },
      rowInfo.nodePath,
    );
  }

  protected removeChildren() {
    const rowInfo = this.getActiveTreeNode();
    if (!rowInfo) {
      return;
    }
    this.dataSourceApi!.updateDataByNodePath(
      {
        children: undefined,
      },
      rowInfo.nodePath,
    );
  }

  protected removeCurrentNode() {
    const rowInfo = this.getActiveTreeNode();
    if (!rowInfo) {
      return;
    }
    this.dataSourceApi!.removeDataByNodePath(rowInfo.nodePath);
  }
}
