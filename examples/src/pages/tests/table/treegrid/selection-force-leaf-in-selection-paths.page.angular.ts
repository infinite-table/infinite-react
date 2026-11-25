import { Component, TemplateRef, signal, viewChild } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';
import type {
  DataSourceApi,
  TreeSelectionValue,
} from '@infinite-table/infinite-angular';

type FileSystemNode = {
  id: string;
  name: string;
  children?: FileSystemNode[];
};

const nodes: FileSystemNode[] = [
  {
    id: '1',
    name: 'Documents',
    children: [
      {
        id: '10',
        name: 'Private',
        children: [
          {
            id: '100',
            name: 'Report.docx',
          },
          {
            id: '101',
            name: 'Vacation.docx',
          },
          {
            id: '102',
            name: 'CV.pdf',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Desktop',
    children: [
      {
        id: '20',
        name: 'unknown.txt',
      },
    ],
  },
  {
    id: '3',
    name: 'Media',
    children: [
      {
        id: '30',
        name: 'Music',
      },
      {
        id: '31',
        name: 'Videos',
        children: [
          {
            id: '310',
            name: 'Vacation.mp4',
          },
          {
            id: '311',
            name: 'Youtube',
            children: [
              {
                id: '3110',
                name: 'Infinity',
              },
              {
                id: '3111',
                name: 'Infinity 2',
              },
            ],
          },
        ],
      },
    ],
  },
];

const defaultTreeSelection: TreeSelectionValue = {
  defaultSelection: false,
  selectedPaths: [['3']],
  deselectedPaths: [['3', '31', '311', '3110']],
};

const dataSource = () => {
  return Promise.resolve(nodes);
};

const domProps = { style: { height: '100%' } };

const treeSelectionState = signal<TreeSelectionValue>(defaultTreeSelection);

(globalThis as any).treeSelectionState = treeSelectionState();

const onTreeSelectionChange = (
  _e: any,
  { treeSelectionState: selState }: { treeSelectionState: any },
) => {
  const newSelection: TreeSelectionValue = {
    defaultSelection: false,
    selectedPaths: selState.getSelectedLeafNodePaths(),
  };
  treeSelectionState.set(newSelection);
  (globalThis as any).treeSelectionState = newSelection;
};

@Component({
  imports: [TreeDataSource, TreeGrid],
  template: `
    <infinite-tree-data-source
      (ready)="onReady($event)"
      nodesKey="children"
      primaryKey="id"
      [data]="dataSource"
      [treeSelection]="treeSelectionState()"
      selectionMode="multi-row"
      [onTreeSelectionChange]="onTreeSelectionChange"
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
export default class SelectionForceLeafInSelectionPathsPage {
  protected readonly dataSource = dataSource;
  protected readonly domProps = domProps;
  protected readonly treeSelectionState = treeSelectionState;
  protected readonly onTreeSelectionChange = onTreeSelectionChange;

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
