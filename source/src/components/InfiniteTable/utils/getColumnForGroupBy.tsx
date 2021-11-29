import * as React from 'react';
import { InfiniteTableColumnRenderParam } from '..';

import { join } from '../../../utils/join';
import { DataSourceGroupRowsBy } from '../../DataSource';
import { ExpanderIcon } from '../components/icons/ExpanderIcon';
import { GroupRowExpanderCls } from '../components/InfiniteTableRow/row.css';

import { InfiniteTableGeneratedGroupColumn } from '../types/InfiniteTableColumn';
import {
  InfiniteTableGroupColumnGetterOptions,
  InfiniteTablePropGroupColumn,
  InfiniteTablePropGroupRenderStrategy,
} from '../types/InfiniteTableProps';
import { alignItems, cssEllipsisClassName, display } from '../utilities.css';

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
  options: InfiniteTableGroupColumnGetterOptions<T> & {
    groupIndexForColumn: number;
    groupByForColumn: DataSourceGroupRowsBy<T>;
  },
  toggleGroupRow: (groupRowKeys: any[]) => void,
  groupColumnFromProps?: InfiniteTablePropGroupColumn<T>,
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
          className={join(display.flex, alignItems.center, GroupRowExpanderCls)}
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
