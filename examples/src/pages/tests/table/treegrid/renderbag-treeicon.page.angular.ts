import { Component, TemplateRef, viewChild } from '@angular/core';

import {
  InfiniteRender,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-angular';

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

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [TreeDataSource, TreeGrid, InfiniteRender],
  template: `
    <infinite-tree-data-source [data]="nodes" primaryKey="id">
      <infinite-tree-grid [domProps]="domProps" [columns]="columns" />
    </infinite-tree-data-source>

    <ng-template
      #treeIcon
      let-renderBag="renderBag"
      let-toggleCurrentTreeNode="toggleCurrentTreeNode"
    >
      <div
        style="width: 24px; display: inline-block; cursor: pointer"
        (click)="toggleCurrentTreeNode()"
      >
        <ng-container [infiniteRender]="renderBag.treeIcon" />
      </div>
    </ng-template>
  `,
})
export default class RenderBagTreeIconPage {
  protected readonly nodes = nodes;
  protected readonly domProps = domProps;

  private readonly treeIcon =
    viewChild.required<TemplateRef<unknown>>('treeIcon');

  protected readonly columns: Record<string, any> = {
    name: {
      field: 'name',
      // the template gets the render params (renderBag, toggleCurrentTreeNode, ...)
      renderTreeIcon: () => this.treeIcon(),
      renderValue: ({ value, data }: { value: any; data: FileSystemNode }) => {
        return `${value} - ${data!.id}`;
      },
    },
    type: { field: 'type' },
    sizeKB: { field: 'sizeKB' },
  };
}
