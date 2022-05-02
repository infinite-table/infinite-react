import * as React from 'react';

import { InfiniteTableColumnRenderParam } from '..';
import { InfiniteTable_HasGrouping_RowInfoGroup } from '../../../utils/groupAndPivot';
import { join } from '../../../utils/join';
import { stripVar } from '../../../utils/stripVar';
import { DataSourceGroupBy } from '../../DataSource';
import { showLoadingIcon } from '../../DataSource/state/rowInfoStatus';
import { Renderable } from '../../types/Renderable';
import { ExpanderIcon } from '../components/icons/ExpanderIcon';
import { LoadingIcon } from '../components/icons/LoadingIcon';
import { GroupRowExpanderCls } from '../components/InfiniteTableRow/row.css';
import { ThemeVars } from '../theme.css';
import {
  InfiniteTableGeneratedGroupColumn,
  InfiniteTableGroupColumnRenderIconParam,
} from '../types/InfiniteTableColumn';
import {
  InfiniteTableGroupColumnBase,
  InfiniteTableGroupColumnGetterOptions,
  InfiniteTablePropGroupColumn,
  InfiniteTablePropGroupRenderStrategy,
} from '../types/InfiniteTableProps';
import { alignItems, cssEllipsisClassName, display } from '../utilities.css';

import { RenderHookComponent } from './RenderHookComponent';

export function getGroupColumnRender<T>({
  groupIndexForColumn,
  groupRenderStrategy,
  toggleGroupRow,
}: {
  toggleGroupRow: (groupRowKeys: any[]) => void;
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  groupIndexForColumn: number;
}) {
  return (renderOptions: InfiniteTableColumnRenderParam<T>) => {
    let { value, rowInfo, column, groupBy, pivotBy } = renderOptions;

    if (column.renderValue) {
      value = (
        <RenderHookComponent
          render={column.renderValue}
          renderParam={renderOptions}
        />
      );
    }

    // for groupRenderStrategy !== 'inline', we work on group rows
    const groupRowInfo = (
      groupRenderStrategy !== 'inline'
        ? rowInfo
        : // while for inline, we need to still work on group rows, but the current row is a data item
          // so we go find the group row via the parents of enhanced data
          (rowInfo.isGroupRow && rowInfo.parents?.[groupIndexForColumn]) ||
          rowInfo
    ) as InfiniteTable_HasGrouping_RowInfoGroup<T>;

    if (!groupRowInfo) {
      return null;
    }

    const collapsed = groupRowInfo!.collapsed;
    const groupKeys = groupRowInfo!.groupKeys!;

    if (groupRenderStrategy === 'inline') {
      if (groupRowInfo.groupCount === 1) {
        return value;
      }

      if (groupRowInfo.groupNesting === groupIndexForColumn && collapsed) {
        return null;
      }
    } else {
      if (!groupRowInfo.isGroupRow) {
        return null;
      }

      if (groupIndexForColumn + 1 !== groupRowInfo.groupNesting) {
        return null;
      }
    }
    let icon: Renderable = null;

    const showExpanderIcon = pivotBy
      ? (groupRowInfo.groupKeys?.length || 0) < groupBy?.length
      : (groupRowInfo.groupKeys?.length || 0) <= groupBy?.length;

    const isLoading = showLoadingIcon(groupRowInfo);

    if (isLoading) {
      icon = <LoadingIcon />;
    } else if (showExpanderIcon) {
      const defaultIcon = (
        <ExpanderIcon
          expanded={!collapsed}
          onChange={() => {
            // if (!data) {
            //   return;
            // }
            toggleGroupRow(groupKeys!);
          }}
        />
      );
      icon = (column as InfiniteTableGroupColumnBase<T>).renderGroupIcon ? (
        <RenderHookComponent
          render={(column as InfiniteTableGroupColumnBase<T>).renderGroupIcon!}
          renderParam={Object.assign(
            { collapsed, groupIcon: defaultIcon },
            renderOptions,
          )}
        />
      ) : (
        defaultIcon
      );
    }

    return (
      <div className={join(display.flex, alignItems.center)}>
        {icon}
        <div className={cssEllipsisClassName}>{value ?? null}</div>
      </div>
    );
  };
}
export function getColumnForGroupBy<T>(
  options: InfiniteTableGroupColumnGetterOptions<T> & {
    groupIndexForColumn: number;
    groupByForColumn: DataSourceGroupBy<T>;
  },
  toggleGroupRow: (groupRowKeys: any[]) => void,
  groupColumnFromProps?: Partial<InfiniteTablePropGroupColumn<T>>,
): InfiniteTableGeneratedGroupColumn<T> {
  const { groupByForColumn, groupIndexForColumn, groupRenderStrategy } =
    options;

  let generatedGroupColumn: InfiniteTableGeneratedGroupColumn<T> = {
    header: `Group by ${groupByForColumn.field}`,
    groupByField: groupByForColumn.field as string,
    sortable: false,
    render: getGroupColumnRender({
      groupIndexForColumn,
      toggleGroupRow,
      groupRenderStrategy,
    }),
    ...groupByForColumn.column,
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

export function getSingleGroupColumn<T>(
  options: InfiniteTableGroupColumnGetterOptions<T>,
  toggleGroupRow: (groupRowKeys: any[]) => void,
  groupColumnFromProps?: Partial<InfiniteTablePropGroupColumn<T>>,
) {
  let generatedGroupColumn: InfiniteTableGeneratedGroupColumn<T> = {
    header: `Group`,
    groupByField: options.groupBy.map((g) => g.field) as string[],
    sortable: false,
    style: ({ rowInfo }) => ({
      [stripVar(ThemeVars.components.Row.groupNesting)]: rowInfo.isGroupRow
        ? rowInfo.groupNesting! - 1
        : 0,
    }),
    render: (renderOptions) => {
      let { value, rowInfo, column, groupBy, pivotBy } = renderOptions;

      if (column.renderValue) {
        value = column.renderValue(renderOptions);
      }

      const collapsed = rowInfo.isGroupRow ? rowInfo.collapsed : false;

      let icon: Renderable = null;

      const showExpanderIcon = rowInfo.isGroupRow
        ? pivotBy
          ? (rowInfo.groupKeys?.length || 0) < groupBy?.length
          : (rowInfo.groupKeys?.length || 0) <= groupBy?.length
        : false;

      const isLoading = showLoadingIcon(rowInfo);

      if (isLoading) {
        icon = <LoadingIcon />;
      } else if (showExpanderIcon) {
        const defaultIcon = (
          <ExpanderIcon
            expanded={!collapsed}
            onChange={() => {
              if (!rowInfo.isGroupRow) {
                return;
              }
              toggleGroupRow(rowInfo.groupKeys!);
            }}
          />
        );
        icon = defaultIcon;
        if ((column as InfiniteTableGroupColumnBase<T>).renderGroupIcon) {
          const renderParam = Object.assign(
            { collapsed, groupIcon: defaultIcon },
            renderOptions,
          ) as InfiniteTableGroupColumnRenderIconParam<T>;

          icon = (column as InfiniteTableGroupColumnBase<T>).renderGroupIcon!(
            renderParam,
          );
        }
      }

      return (
        <div
          className={join(display.flex, alignItems.center, GroupRowExpanderCls)}
        >
          {icon}
          <div className={cssEllipsisClassName}>{value ?? null}</div>
        </div>
      );
    },
  };

  // if (options.groupRenderStrategy === 'single-column-extended') {
  //   generatedGroupColumn.colspan = () => {
  //     return 2;
  //   };
  // }

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
