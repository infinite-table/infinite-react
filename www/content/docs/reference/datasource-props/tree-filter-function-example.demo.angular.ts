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
              name: 'CV John Doe.pdf',
              sizeInKB: 108,
              type: 'file',
              extension: 'pdf',
              mimeType: 'application/pdf',
            },
            {
              id: '103',
              name: 'resume mary.pptx',
              sizeInKB: 210,
              type: 'file',
              extension: 'pptx',
              mimeType: 'application/presentation',
            },
            {
              id: '104',
              name: 'resume bob.pdf',
              sizeInKB: 1210,
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
        {
          id: '21',
          name: 'resume.docx',
          sizeInKB: 210,
          type: 'file',
          extension: 'docx',
          mimeType: 'application/msword',
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
      [treeFilterFunction]="filterFunction()"
    >
      <div style="color: var(--infinite-cell-color); padding: 10px">
        <input
          type="text"
          name="filter"
          style="padding: 10px; border: 1px solid black; border-radius: 5px; min-width: 250px"
          placeholder="Type to filter by name"
          [value]="filter()"
          (input)="onFilterChange($event)"
        />
      </div>

      <infinite-tree-grid [columns]="columns" />
    </infinite-tree-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;

  protected readonly filter = signal('');

  // #highlight a new filter function when the filter text changes
  protected readonly filterFunction = computed(() => {
    const filter = this.filter();

    return ({
      data,
      filterTreeNode,
    }: {
      data: FileSystemNode;
      filterTreeNode: (data: FileSystemNode) => FileSystemNode | boolean;
    }) => {
      if (!Array.isArray(data.children)) {
        return data.name.toLowerCase().includes(filter.toLowerCase());
      }

      return filterTreeNode(data);
    };
  });
  // #endhighlight

  protected onFilterChange(event: Event) {
    this.filter.set((event.target as HTMLInputElement).value);
  }
}
