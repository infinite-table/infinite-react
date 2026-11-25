import { Component } from '@angular/core';

import {
  InfiniteTable,
  TreeDataSource,
} from '@infinite-table/infinite-angular';

import { nodes } from './default.data';
import type { FileSystemNode } from './default.data';

const columns: Record<string, any> = {
  name: {
    field: 'name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
    renderValue: ({ value, data }: { value: any; data: FileSystemNode }) => {
      return `${value} - ${data!.id}`;
    },
  },
  type: { field: 'type' },
  sizeKB: { field: 'sizeKB' },
};

const defaultTreeExpandState = {
  defaultExpanded: true as const,
  collapsedPaths: [['8']],
};

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [TreeDataSource, InfiniteTable],
  template: `
    <infinite-tree-data-source
      [data]="nodes"
      primaryKey="id"
      nodesKey="children"
      selectionMode="single-row"
      defaultTreeSelection="2"
      [defaultTreeExpandState]="defaultTreeExpandState"
    >
      <infinite-table
        [wrapRowsHorizontally]="true"
        keyboardNavigation="row"
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-tree-data-source>
  `,
})
export default class SingleSelectPage {
  protected readonly nodes = nodes;
  protected readonly columns = columns;
  protected readonly defaultTreeExpandState = defaultTreeExpandState;
  protected readonly domProps = domProps;
}
