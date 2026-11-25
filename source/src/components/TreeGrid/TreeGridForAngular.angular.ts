/**
 * Angular siblings of the TreeGrid + TreeDataSource convenience wrappers
 * (Vue: TreeGridForVue.vue.ts).
 *
 * - TreeGrid is just an InfiniteTable (tree behavior is driven entirely by
 *   the DataSource's nodesKey + the column's renderTreeIcon)
 * - TreeDataSource is a DataSource preset with nodesKey defaulting to
 *   'children'
 *
 * Both are subclasses (templates can't spread props onto another
 * component): the same inputs, models and outputs, another selector.
 */
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  forwardRef,
  inject,
} from '@angular/core';

import { toTreeDataArray } from '../../utils/groupAndPivot/treeUtils';
import {
  DataSource,
  INFINITE_DATA_SOURCE,
} from '../DataSource/DataSourceForAngular.angular';
import type { DataSourceInputsProps } from '../DataSource/DataSourceInputs.generated.angular';
import {
  INFINITE_TABLE_IMPORTS,
  INFINITE_TABLE_PROVIDERS,
  INFINITE_TABLE_TEMPLATE,
  InfiniteTable,
} from '../InfiniteTable/InfiniteTableForAngular.angular';

export { withSelectedLeafNodesOnly } from './treeSelectionUtils';
export { toTreeDataArray };

/**
 * An InfiniteTable for tree data - put it in a TreeDataSource:
 *
 * ```html
 * <infinite-tree-data-source primaryKey="id" [data]="data">
 *   <infinite-tree-grid [columns]="columns" />
 * </infinite-tree-data-source>
 * ```
 *
 * The column that shows the tree has `renderTreeIcon: true`.
 */
@Component({
  selector: 'infinite-tree-grid',
  exportAs: 'infiniteTable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: INFINITE_TABLE_IMPORTS,
  // the host bindings are inherited from InfiniteTable
  providers: [
    { provide: InfiniteTable, useExisting: forwardRef(() => TreeGrid) },
    ...INFINITE_TABLE_PROVIDERS,
  ],
  template: INFINITE_TABLE_TEMPLATE,
})
export class TreeGrid<T = any> extends InfiniteTable<T> {}

/**
 * A DataSource for tree data: `nodesKey` defaults to 'children'.
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
  protected override propOverrides(): Partial<DataSourceInputsProps<T>> {
    return { nodesKey: this.nodesKey() ?? 'children' };
  }
}
