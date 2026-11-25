import { Component, computed, signal } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropTreeSelection_MultiNode,
  InfiniteTablePropColumns,
  TreeExpandStateValue,
} from '@infinite-table/infinite-angular';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemNode[];
};

const file = (id: string): FileSystemNode => ({ id, name: id, type: 'file' });

const folder = (id: string, children: FileSystemNode[]): FileSystemNode => ({
  id,
  name: id,
  type: 'folder',
  children,
});

const nodes: FileSystemNode[] = [
  folder('docs', [file('a'), file('b')]),
  folder('pics', [file('x'), file('y')]),
  folder('music', [file('s1'), file('s2'), folder('sub', [file('t1')])]),
];

const domProps = { style: { height: '80vh' } };

const defaultTreeExpandState: TreeExpandStateValue = {
  defaultExpanded: true,
  collapsedPaths: [['pics']],
};

const multiRowSelection: DataSourcePropTreeSelection_MultiNode = {
  defaultSelection: false,
  selectedPaths: [],
};

@Component({
  imports: [TreeDataSource, TreeGrid],
  template: `
    <div style="display: flex; flex-wrap: wrap; gap: 4px">
      <button data-name="single-row" (click)="setMode(true)">single-row</button>
      <button data-name="multi-row" (click)="setMode(false)">multi-row</button>
      <button data-name="checkbox-on" (click)="checkbox.set(true)">
        checkbox-on
      </button>
      <button data-name="checkbox-off" (click)="checkbox.set(false)">
        checkbox-off
      </button>
      <button data-name="select-with-click" (click)="selectWith.set('click')">
        select-with-click
      </button>
      <button
        data-name="select-with-checkbox"
        (click)="selectWith.set('checkbox')"
      >
        select-with-checkbox
      </button>
    </div>
    <pre data-name="selection-config">{{ config() }}</pre>
    <pre data-name="selected-ids">{{ selectedIdsText() }}</pre>
    <!-- a new DataSource when the selection mode changes (Vue's :key) -->
    @for (mode of modeKey(); track mode) {
    <infinite-tree-data-source
      [data]="nodes"
      primaryKey="id"
      nodesKey="children"
      [defaultTreeExpandState]="defaultTreeExpandState"
      [selectionMode]="singleRow() ? 'single-row' : 'multi-row'"
      [defaultTreeSelection]="singleRow() ? null : multiRowSelection"
      [onTreeSelectionChange]="onTreeSelectionChange"
    >
      <infinite-tree-grid
        [domProps]="domProps"
        [columns]="columns()"
        [multiRowSelectionWith]="selectWith()"
        [columnDefaultWidth]="200"
      />
    </infinite-tree-data-source>
    }
  `,
})
export default class TreeClickAndCheckboxPage {
  protected readonly nodes = nodes;
  protected readonly domProps = domProps;
  protected readonly defaultTreeExpandState = defaultTreeExpandState;
  protected readonly multiRowSelection = multiRowSelection;

  protected readonly singleRow = signal(false);
  protected readonly checkbox = signal(false);
  protected readonly selectWith = signal<'click' | 'checkbox'>('checkbox');
  private readonly selectedIds = signal<string[]>([]);

  protected readonly modeKey = computed(() => [
    this.singleRow() ? 'single-row' : 'multi-row',
  ]);

  protected readonly columns = computed(
    (): InfiniteTablePropColumns<FileSystemNode> => ({
      name: {
        field: 'name',
        renderTreeIcon: true,
        renderSelectionCheckBox: this.checkbox(),
      },
      type: { field: 'type' },
    }),
  );

  protected setMode(single: boolean) {
    this.singleRow.set(single);
    this.selectedIds.set([]);
  }

  protected readonly onTreeSelectionChange = (value: any, params: any) => {
    if (params.selectionMode === 'single-row') {
      this.selectedIds.set(value == null ? [] : [value]);
      return;
    }
    this.selectedIds.set(
      params.treeSelectionState
        .getSelectedLeafNodePaths()
        .map((path: string[]) => path[path.length - 1])
        .sort(),
    );
  };

  protected readonly config = computed(() =>
    JSON.stringify({
      singleRow: this.singleRow(),
      checkbox: this.checkbox(),
      selectWith: this.selectWith(),
    }),
  );

  protected readonly selectedIdsText = computed(() =>
    JSON.stringify(this.selectedIds()),
  );
}
