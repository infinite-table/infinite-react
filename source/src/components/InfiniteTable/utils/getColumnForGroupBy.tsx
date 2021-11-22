import * as React from 'react';
import { InfiniteTableColumnRenderParam } from '..';

import { join } from '../../../utils/join';
import { DataSourceGroupRowsBy } from '../../DataSource';
import { ExpanderIcon } from '../components/icons/ExpanderIcon';

import { InfiniteTableGeneratedGroupColumn } from '../types/InfiniteTableColumn';
import {
  GroupColumnGetterOptions,
  InfiniteTablePropGroupColumn,
  InfiniteTablePropGroupRenderStrategy,
} from '../types/InfiniteTableProps';
import { alignItems, cssEllipsisClassName, display } from '../utilities.css';

export function getGroupColumnRender<T>({
  groupIndex,
  groupRenderStrategy,
  toggleGroupRow,
}: {
  toggleGroupRow: (groupRowKeys: any[]) => void;
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  groupIndex: number;
}) {
  return (renderOptions: InfiniteTableColumnRenderParam<T>) => {
    let { value, rowInfo, column } = renderOptions;
    if (column.renderValue) {
      value = column.renderValue(renderOptions);
    }

    // for groupRenderStrategy !== 'inline', we work on group rows
    let groupRowInfo =
      groupRenderStrategy !== 'inline'
        ? rowInfo
        : // while for inline, we need to still work on group rows, but the current row is a data item
          // so we go find the group row via the parents of enhanced data
          rowInfo.parents?.[groupIndex] || rowInfo;

    if (!groupRowInfo) {
      return null;
    }

    const collapsed = groupRowInfo!.collapsed;
    const groupKeys = groupRowInfo!.groupKeys!;

    if (groupRenderStrategy === 'inline') {
      if (groupRowInfo.groupCount === 1) {
        return value;
      }

      if (groupRowInfo.groupNesting === groupIndex && collapsed) {
        return null;
      }
    } else {
      if (!groupRowInfo.isGroupRow) {
        return null;
      }

      if (groupIndex + 1 !== groupRowInfo.groupNesting) {
        return null;
      }
    }

    return (
      <div className={join(display.flex, alignItems.center)}>
        <ExpanderIcon
          expanded={!collapsed}
          onChange={() => {
            toggleGroupRow(groupKeys!);
          }}
        />
        <div className={cssEllipsisClassName}>{value ?? null}</div>
      </div>
    );
  };
}
export function getColumnForGroupBy<T>(
  options: GroupColumnGetterOptions<T> & {
    groupIndex: number;

    groupBy: DataSourceGroupRowsBy<T>;
    groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  },
  toggleGroupRow: (groupRowKeys: any[]) => void,
  groupColumnFromProps?: InfiniteTablePropGroupColumn<T>,
): InfiniteTableGeneratedGroupColumn<T> {
  const { groupBy, groupIndex, groupRenderStrategy } = options;

  let generatedGroupColumn: InfiniteTableGeneratedGroupColumn<T> = {
    header: `Group by ${groupBy.field}`,
    groupByField: groupBy.field as string,
    sortable: false,
    render: getGroupColumnRender({
      groupIndex,
      toggleGroupRow,
      groupRenderStrategy,
    }),
    ...groupBy.column,
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
  options: GroupColumnGetterOptions<T>,
  toggleGroupRow: (groupRowKeys: any[]) => void,
  groupColumnFromProps?: InfiniteTablePropGroupColumn<T>,
) {
  let generatedGroupColumn: InfiniteTableGeneratedGroupColumn<T> = {
    header: `Group`,
    groupByField: options.groupRowsBy.map((g) => g.field) as string[],
    sortable: false,
    render: (renderOptions) => {
      let { value, rowInfo, column } = renderOptions;
      if (!rowInfo.isGroupRow) {
        return null;
      }

      if (column.renderValue) {
        value = column.renderValue(renderOptions);
      }
      return (
        <div
          className={join(display.flex, alignItems.center)}
          style={{
            paddingInlineStart: `calc(${
              rowInfo.groupNesting! - 1
            } * var(--ITableRow-group-column-nesting))`,
          }}
        >
          <ExpanderIcon
            expanded={!rowInfo.collapsed}
            onChange={() => {
              toggleGroupRow(rowInfo.groupKeys!);
            }}
          />
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
