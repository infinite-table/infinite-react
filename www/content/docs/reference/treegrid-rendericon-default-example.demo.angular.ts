import { Component, computed, signal } from '@angular/core';

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
      children: [],
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
          <option value="none" [selected]="treeIcon() === 'none'">
            No tree column
          </option>
        </select>
      </div>

      <infinite-tree-grid [columns]="columns()" />
    </infinite-tree-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columnKeys = Object.keys(allColumns);

  protected readonly treeIcon = signal<string>('name');

  protected readonly columns = computed(() => {
    const cols = { ...allColumns };
    const treeIcon = this.treeIcon();

    // #highlight the column that shows the tree icon
    cols[treeIcon] = {
      ...cols[treeIcon],
      renderTreeIcon: true,
    };
    // #endhighlight

    return cols;
  });

  protected onTreeIconChange(event: Event) {
    this.treeIcon.set((event.target as HTMLSelectElement).value);
  }
}
