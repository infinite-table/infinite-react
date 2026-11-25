/**
 * Angular siblings of the TreeGrid + TreeDataSource convenience wrappers.
 *
 * - TreeGrid is the InfiniteTable (`<infinite-tree-grid>` is one of its
 *   selectors): the tree comes from the DataSource's nodesKey and the
 *   column's renderTreeIcon
 * - TreeDataSource is a DataSource with nodesKey defaulting to 'children'
 */
import { Directive, forwardRef, inject } from '@angular/core';

import { toTreeDataArray } from '../../utils/groupAndPivot/treeUtils';
import {
  DataSource,
  INFINITE_DATA_SOURCE,
} from '../DataSource/DataSourceForAngular.angular';
import type { DataSourceProps } from '../DataSource/types';
import { InfiniteTable } from '../InfiniteTable/InfiniteTableForAngular.angular';

export { withSelectedLeafNodesOnly } from './treeSelectionUtils';
export { toTreeDataArray };

/**
 * A DataSource for tree data: the child nodes are in `nodesKey`
 * (`'children'` by default).
 *
 * ```html
 * <infinite-tree-data-source primaryKey="id" [data]="nodes">
 *   <infinite-tree-grid [columns]="columns" />
 * </infinite-tree-data-source>
 * ```
 */
@Directive({
  selector: 'infinite-tree-data-source, [infiniteTreeDataSource]',
  exportAs: 'infiniteDataSource',
  providers: [
    { provide: DataSource, useExisting: forwardRef(() => TreeDataSource) },
    {
      provide: INFINITE_DATA_SOURCE,
      useFactory: () => inject(TreeDataSource).context,
    },
  ],
})
export class TreeDataSource<T = any> extends DataSource<T> {
  protected override presetProps(): Partial<DataSourceProps<T>> {
    return { nodesKey: this.nodesKey() ?? ('children' as any) };
  }
}

/**
 * The InfiniteTable, used as `<infinite-tree-grid>` inside a TreeDataSource.
 */
export const TreeGrid = InfiniteTable;
export type TreeGrid<T = any> = InfiniteTable<T>;
