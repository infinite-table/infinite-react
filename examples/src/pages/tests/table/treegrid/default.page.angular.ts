import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  TreeDataSource,
  TreeGrid,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

import { nodes } from './default.data';
import type { FileSystemNode } from './default.data';

const columns: InfiniteTablePropColumns<FileSystemNode> = {
  name: {
    field: 'name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
    renderValue: ({ value, data }) => `${value} - ${data!.id}`,
  },
  type: { field: 'type' },
  sizeKB: { field: 'sizeKB' },
};

@Component({
  selector: 'test-page',
  imports: [TreeDataSource, TreeGrid],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <infinite-tree-data-source
      [data]="nodes"
      primaryKey="id"
      nodesKey="children"
      selectionMode="multi-row"
      [defaultTreeSelection]="defaultTreeSelection"
      [defaultTreeExpandState]="defaultTreeExpandState"
    >
      <infinite-tree-grid
        wrapRowsHorizontally
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-tree-data-source>
  `,
})
export default class TreeGridDefaultPage {
  protected readonly nodes = nodes;
  protected readonly columns = columns;

  protected readonly defaultTreeSelection = {
    defaultSelection: false as const,
    selectedPaths: [
      ['1', '4', '5'],
      ['1', '3'],
    ],
  };

  protected readonly defaultTreeExpandState = {
    defaultExpanded: true as const,
    collapsedPaths: [['8']],
  };

  protected readonly domProps = {
    style: {
      margin: '5px',
      height: '900px',
      border: '1px solid gray',
      position: 'relative' as const,
    },
  };
}
