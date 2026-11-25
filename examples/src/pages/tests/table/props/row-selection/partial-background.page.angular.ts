import { Component, signal } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-angular';
import type {
  DataSourcePropTreeSelection_MultiNode,
  TreeExpandStateValue,
} from '@infinite-table/infinite-angular';

import { data, height80vhDomProps, type Developer } from './common';

const columns: Record<string, any> = {
  checkbox: { renderSelectionCheckBox: true, defaultWidth: 70 },
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
};

// JavaScript rows (ids 1 and 2, both in "frontend") are filtered out.
// Visible: frontend / Bill (3), backend / Mark (4), Matthew (5).
const filterFunction = ({ data }: { data: Developer }) =>
  data.preferredLanguage !== 'JavaScript';

type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
};

const treeNodes: TreeNode[] = [
  {
    id: 'docs',
    name: 'docs',
    children: [
      { id: 'a', name: 'a' },
      { id: 'b', name: 'b' },
    ],
  },
  {
    id: 'solo',
    name: 'solo',
    children: [{ id: 'z', name: 'z' }],
  },
];

const treeColumns: Record<string, any> = {
  name: {
    field: 'name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
  },
};

const groupBy = [{ field: 'stack' as const }];

const defaultTreeExpandState: TreeExpandStateValue = {
  defaultExpanded: true,
  collapsedPaths: [],
};
const defaultTreeSelection: DataSourcePropTreeSelection_MultiNode = {
  defaultSelection: false,
  selectedPaths: [],
};

@Component({
  imports: [DataSource, InfiniteTable, TreeDataSource, TreeGrid],
  template: `
    @if (kind() === 'tree') {
      <infinite-tree-data-source
        primaryKey="id"
        nodesKey="children"
        [data]="treeNodes"
        selectionMode="multi-row"
        [defaultTreeExpandState]="defaultTreeExpandState"
        [defaultTreeSelection]="defaultTreeSelection"
      >
        <infinite-tree-grid
          [domProps]="domProps"
          [columns]="treeColumns"
          [columnDefaultWidth]="220"
        />
      </infinite-tree-data-source>
    } @else {
      <infinite-data-source
        primaryKey="id"
        [data]="data"
        selectionMode="multi-row"
        multiRowSelectionTarget="all"
        [groupBy]="groupBy"
        [filterFunction]="filterFunction"
      >
        <infinite-table [domProps]="domProps" [columns]="columns" />
      </infinite-data-source>
    }
  `,
})
export default class PartialBackgroundPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly filterFunction = filterFunction;
  protected readonly treeNodes = treeNodes;
  protected readonly treeColumns = treeColumns;
  protected readonly defaultTreeExpandState = defaultTreeExpandState;
  protected readonly defaultTreeSelection = defaultTreeSelection;
  protected readonly domProps = height80vhDomProps;

  protected readonly kind = signal<'group' | 'tree'>('group');

  constructor() {
    (globalThis as any).setKind = (value: 'group' | 'tree') => {
      this.kind.set(value);
    };
  }
}
