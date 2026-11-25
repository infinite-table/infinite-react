import { Component, TemplateRef, viewChild } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';

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
  imports: [TreeDataSource, TreeGrid],
  template: `
    <infinite-tree-data-source [data]="nodes" primaryKey="id">
      <infinite-tree-grid [domProps]="domProps" [columns]="columns" />
    </infinite-tree-data-source>

    <ng-template
      #treeIcon
      let-rowInfo="rowInfo"
      let-toggleCurrentTreeNode="toggleCurrentTreeNode"
    >
      <div
        class="custom-tree-icon"
        [attr.data-type]="rowInfo.isParentNode ? 'parent' : 'leaf'"
        [attr.data-path]="rowInfo.nodePath.join('/')"
        style="width: 24px; display: inline-block; cursor: pointer"
        (click)="toggleCurrentTreeNode()"
      >
        {{ rowInfo.isParentNode ? (rowInfo.nodeExpanded ? '👇' : '👉') : '🔴' }}
      </div>
    </ng-template>
  `,
})
export default class CustomTreeIconPage {
  protected readonly nodes = nodes;
  protected readonly domProps = domProps;

  private readonly treeIcon =
    viewChild.required<TemplateRef<unknown>>('treeIcon');

  protected readonly columns: Record<string, any> = {
    name: {
      field: 'name',
      // the template gets the render params (rowInfo, toggleCurrentTreeNode, ...)
      renderTreeIcon: () => this.treeIcon(),
      renderValue: ({ value, data }: { value: any; data: FileSystemNode }) => {
        return `${value} - ${data!.id}`;
      },
    },
    type: { field: 'type' },
    sizeKB: { field: 'sizeKB' },
  };
}
