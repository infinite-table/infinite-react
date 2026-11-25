import { Component } from '@angular/core';

import { TreeDataSource, TreeGrid } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropTreeSelection_MultiNode,
  InfiniteTablePropColumns,
  TreeExpandStateValue,
} from '@infinite-table/infinite-angular';

import { nodes } from './default.data';
import type { FileSystemNode } from './default.data';

@Component({
  imports: [TreeDataSource, TreeGrid],
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
        [wrapRowsHorizontally]="true"
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-tree-data-source>
  `,
})
export default class TreeGridDefaultPage {
  protected readonly nodes = nodes;
  protected readonly columns: InfiniteTablePropColumns<FileSystemNode> = {
    name: {
      field: 'name',
      renderTreeIcon: true,
      renderSelectionCheckBox: true,
      renderValue: ({ value, data }) => {
        return `${value} - ${data!.id}`;
      },
    },
    type: { field: 'type' },
    sizeKB: { field: 'sizeKB' },
  };
  protected readonly defaultTreeSelection: DataSourcePropTreeSelection_MultiNode = {
    defaultSelection: false,
    selectedPaths: [
      ['1', '4', '5'],
      ['1', '3'],
    ],
  };
  protected readonly defaultTreeExpandState: TreeExpandStateValue = {
    defaultExpanded: true,
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
