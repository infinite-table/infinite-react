import {
  Component,
  TemplateRef,
  computed,
  signal,
  viewChild,
} from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';
import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  mimeType?: string;
  sizeInKB: number;
  children?: FileSystemNode[];
};

const allColumns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: { field: 'name', header: 'Name' },
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
          sizeInKB: 108,
          type: 'file',
          extension: 'txt',
          mimeType: 'text/plain',
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
          name: 'Music',
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

@Component({
  selector: 'demo-root',
  imports: [TreeDataSource, TreeGrid],
  template: `
    <infinite-tree-data-source
      nodesKey="children"
      primaryKey="id"
      [data]="dataSource"
    >
      <div style="color: var(--infinite-cell-color); padding: 10px">
        <p>Select the tree column</p>
        <select
          (change)="onTreeIconChange($event)"
          title="Select column to use for the tree icon"
        >
          @for (key of columnKeys; track key) {
            <option [value]="key" [selected]="key === treeIcon()">
              {{ key }}
            </option>
          }
          <option value="no" [selected]="treeIcon() === 'no'">
            No tree column
          </option>
        </select>
      </div>

      <infinite-tree-grid [columns]="columns()" />
    </infinite-tree-data-source>

    <!-- #highlight the custom expand/collapse icon, with the render params as context -->
    <ng-template
      #treeIconTemplate
      let-rowInfo="rowInfo"
      let-toggleCurrentTreeNode="toggleCurrentTreeNode"
    >
      <div
        style="width: 24px; font-size: 12px; display: inline-block; cursor: pointer"
        (click)="toggleCurrentTreeNode()"
      >
        {{ rowInfo.isParentNode ? (rowInfo.nodeExpanded ? '👇' : '👉') : '🔴' }}
      </div>
    </ng-template>
    <!-- #endhighlight -->
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columnKeys = Object.keys(allColumns);

  protected readonly treeIcon = signal<string>('name');

  private readonly treeIconTemplate =
    viewChild.required<TemplateRef<unknown>>('treeIconTemplate');

  protected readonly columns = computed(() => {
    const cols = { ...allColumns };
    const treeIcon = this.treeIcon();

    cols[treeIcon] = {
      ...cols[treeIcon],
      renderTreeIcon: () => this.treeIconTemplate(),
    };

    return cols;
  });

  protected onTreeIconChange(event: Event) {
    this.treeIcon.set((event.target as HTMLSelectElement).value);
  }
}
