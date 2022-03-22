import * as React from 'react';
import { InfiniteTableColumnRenderParam } from '..';

import { join } from '../../../utils/join';
import { DataSourceGroupBy } from '../../DataSource';
import { Renderable } from '../../types/Renderable';
import { ExpanderIcon } from '../components/icons/ExpanderIcon';
import { GroupRowExpanderCls } from '../components/InfiniteTableRow/row.css';

import { InfiniteTableGeneratedGroupColumn } from '../types/InfiniteTableColumn';
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
    let groupRowInfo =
      groupRenderStrategy !== 'inline'
        ? rowInfo
        : // while for inline, we need to still work on group rows, but the current row is a data item
          // so we go find the group row via the parents of enhanced data
          rowInfo.parents?.[groupIndexForColumn] || rowInfo;

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

    if (showExpanderIcon) {
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
  const {
    groupByForColumn: groupByForColumn,
    groupIndexForColumn: groupIndexForColumn,
    groupRenderStrategy,
  } = options;

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
    render: (renderOptions) => {
      let { value, rowInfo, column, groupBy, pivotBy } = renderOptions;
      if (!rowInfo.isGroupRow) {
        return null;
      }

      if (column.renderValue) {
        value = column.renderValue(renderOptions);
      }
      // console.log({ rowInfo, value });

      const collapsed = rowInfo.collapsed;

      let icon: Renderable = null;

      const showExpanderIcon = pivotBy
        ? (rowInfo.groupKeys?.length || 0) < groupBy?.length
        : (rowInfo.groupKeys?.length || 0) <= groupBy?.length;

      if (showExpanderIcon) {
        const defaultIcon = (
          <ExpanderIcon
            expanded={!collapsed}
            onChange={() => {
              toggleGroupRow(rowInfo.groupKeys!);
            }}
          />
        );
        icon = (column as InfiniteTableGroupColumnBase<T>).renderGroupIcon
          ? (column as InfiniteTableGroupColumnBase<T>).renderGroupIcon!(
              Object.assign(
                { collapsed, groupIcon: defaultIcon },
                renderOptions,
              ),
            )
          : defaultIcon;
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
