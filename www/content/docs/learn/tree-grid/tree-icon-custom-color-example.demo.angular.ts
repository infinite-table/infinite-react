import { Component } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';
import type {
  CSSProperties,
  InfiniteTableColumn,
  InfiniteTableProps,
} from '@infinite-table/infinite-angular';

const domProps: InfiniteTableProps<FileSystemNode>['domProps'] = {
  style: {
    // specify it here or in your CSS file
    '--infinite-expand-collapse-icon-color': '#6f6f6f',
  } as CSSProperties,
};

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  sizeInKB: number;
  children?: FileSystemNode[];
};

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: { renderTreeIcon: true, field: 'name', header: 'Name' },
  type: { field: 'type', header: 'Type' },
  extension: { field: 'extension', header: 'Extension' },
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
            },
            {
              id: '101',
              name: 'Vacation.docx',
              sizeInKB: 120,
              type: 'file',
              extension: 'docx',
            },
            {
              id: '102',
              name: 'CV.pdf',
              sizeInKB: 108,
              type: 'file',
              extension: 'pdf',
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
          extension: 'txt',
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
      <infinite-tree-grid [columns]="columns" [domProps]="domProps" />
    </infinite-tree-data-source>
  `,
})
export default class App {
  protected readonly columns = columns;
  protected readonly dataSource = dataSource;
  protected readonly domProps = domProps;
}
