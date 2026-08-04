/**
 * Framework-neutral group-column generation.
 *
 * The structure of the generated group columns (header, groupByForColumn,
 * user overrides, groupColumn prop merging) is identical across frameworks -
 * only the `render` / `renderGroupIcon` implementations differ, since they
 * produce framework UI nodes. Each framework sibling of getColumnForGroupBy
 * supplies those factories and delegates the rest to this module.
 */
import { DataSourceGroupBy } from '../../DataSource';

import {
  InfiniteTableColumn,
  InfiniteTableGeneratedGroupColumn,
} from '../types/InfiniteTableColumn';
import {
  InfiniteTableGroupColumnGetterOptions,
  InfiniteTablePropGroupColumn,
  InfiniteTablePropGroupRenderStrategy,
} from '../types/InfiniteTableProps';

export type GroupColumnRenderers<T> = {
  getGroupColumnRender: (params: {
    groupIndexForColumn: number;
    groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  }) => InfiniteTableColumn<T>['render'];
  getGroupColumnRenderGroupIcon: (params: {
    groupIndexForColumn: number;
    groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
    toggleGroupRow: (groupRowKeys: any[]) => void;
    initialRenderGroupIcon?: InfiniteTableColumn<T>['renderGroupIcon'];
  }) => InfiniteTableColumn<T>['renderGroupIcon'];
};

export function buildColumnForGroupBy<T>(
  options: InfiniteTableGroupColumnGetterOptions<T> & {
    groupIndexForColumn: number;
    groupByForColumn: DataSourceGroupBy<T>;
  },
  toggleGroupRow: (groupRowKeys: any[]) => void,
  groupColumnFromProps: Partial<InfiniteTablePropGroupColumn<T>> | undefined,
  renderers: GroupColumnRenderers<T>,
): InfiniteTableGeneratedGroupColumn<T> {
  const { groupByForColumn, groupIndexForColumn, groupRenderStrategy } =
    options;

  const userDefinedGroupColumn: Partial<InfiniteTableColumn<T>> =
    groupByForColumn.column ? { ...groupByForColumn.column } : {};

  let generatedGroupColumn: InfiniteTableGeneratedGroupColumn<T> = {
    header: `Group by ${groupByForColumn.field || groupByForColumn.groupField}`,
    groupByForColumn,

    render: renderers.getGroupColumnRender({
      groupIndexForColumn,
      groupRenderStrategy,
    }),
    ...userDefinedGroupColumn,
    renderGroupIcon: renderers.getGroupColumnRenderGroupIcon({
      initialRenderGroupIcon: userDefinedGroupColumn?.renderGroupIcon,
      groupIndexForColumn,
      toggleGroupRow,
      groupRenderStrategy,
    }),
  };

  if (groupColumnFromProps) {
    if (typeof groupColumnFromProps === 'function') {
      generatedGroupColumn = {
        ...generatedGroupColumn,
        ...groupColumnFromProps(options, toggleGroupRow),
      } as InfiniteTableGeneratedGroupColumn<T>;
    } else {
      generatedGroupColumn = {
        ...generatedGroupColumn,
        ...groupColumnFromProps,
      } as InfiniteTableGeneratedGroupColumn<T>;
    }
  }
  return generatedGroupColumn;
}

export function buildSingleGroupColumn<T>(
  options: InfiniteTableGroupColumnGetterOptions<T>,
  toggleGroupRow: (groupRowKeys: any[]) => void,
  groupColumnFromProps: Partial<InfiniteTablePropGroupColumn<T>> | undefined,
  renderers: GroupColumnRenderers<T>,
): InfiniteTableGeneratedGroupColumn<T> {
  const theGroupColumnFromProps =
    typeof groupColumnFromProps === 'function'
      ? groupColumnFromProps(options, toggleGroupRow)
      : groupColumnFromProps;

  const base: { sortable?: boolean } = {};

  if (options.sortable != undefined) {
    base.sortable = options.sortable;
  }
  const generatedGroupColumn: InfiniteTableGeneratedGroupColumn<T> = {
    ...base,
    header: `Group`,
    groupByForColumn: options.groupBy,
    renderSelectionCheckBox: options.selectionMode === 'multi-row',

    render: renderers.getGroupColumnRender({
      groupIndexForColumn: 0,
      groupRenderStrategy: 'single-column',
    }),
    ...theGroupColumnFromProps,
    renderGroupIcon: renderers.getGroupColumnRenderGroupIcon({
      initialRenderGroupIcon: theGroupColumnFromProps?.renderGroupIcon,
      groupIndexForColumn: 0,
      toggleGroupRow,
      groupRenderStrategy: 'single-column',
    }),
  };

  return generatedGroupColumn;
}
