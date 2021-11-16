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
    let { value, enhancedData, column } = renderOptions;
    if (column.renderValue) {
      value = column.renderValue(renderOptions);
    }

    // for groupRenderStrategy !== 'inline', we work on group rows
    let groupRowEnhancedData =
      groupRenderStrategy !== 'inline'
        ? enhancedData
        : // while for inline, we need to still work on group rows, but the current row is a data item
          // so we go find the group row via the parents of enhanced data
          enhancedData.parents?.[groupIndex] || enhancedData;

    if (!groupRowEnhancedData) {
      return null;
    }

    const collapsed = groupRowEnhancedData!.collapsed;
    const groupKeys = groupRowEnhancedData!.groupKeys!;

    if (groupRenderStrategy === 'inline') {
      if (groupRowEnhancedData.groupCount === 1) {
        return value;
      }

      if (groupRowEnhancedData.groupNesting === groupIndex && collapsed) {
        return null;
      }
    } else {
      if (!groupRowEnhancedData.isGroupRow) {
        return null;
      }

      if (groupIndex + 1 !== groupRowEnhancedData.groupNesting) {
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
      let { value, enhancedData, column } = renderOptions;
      if (!enhancedData.isGroupRow) {
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
              enhancedData.groupNesting! - 1
            } * var(--ITableRow-group-column-nesting))`,
          }}
        >
          <ExpanderIcon
            expanded={!enhancedData.collapsed}
            onChange={() => {
              toggleGroupRow(enhancedData.groupKeys!);
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
