import * as React from 'react';
import { cssEllipsisClassName } from '../../../style/css';
import { ICSS } from '../../../style/utilities';
import { join } from '../../../utils/join';
import { DataSourceGroupRowsBy } from '../../DataSource';
import { ExpanderIcon } from '../components/icons/ExpanderIcon';

import { InfiniteTableGeneratedColumn } from '../types/InfiniteTableColumn';
import {
  GroupColumnGetterOptions,
  InfiniteTablePropGroupColumn,
} from '../types/InfiniteTableProps';

export function getColumnForGroupBy<T>(
  options: GroupColumnGetterOptions<T> & {
    groupIndex: number;

    groupBy: DataSourceGroupRowsBy<T>;
  },
  toggleGroupRow: (groupRowKeys: any[]) => void,
  groupColumnFromProps?: InfiniteTablePropGroupColumn<T>,
): InfiniteTableGeneratedColumn<T> {
  const { groupBy, groupIndex } = options;

  let generatedGroupColumn: InfiniteTableGeneratedColumn<T> = {
    header: `Group by ${groupBy.field}`,
    groupByField: groupBy.field as string,
    sortable: false,
    render: (renderOptions) => {
      let { value, enhancedData, column } = renderOptions;
      if (!enhancedData.isGroupRow) {
        return null;
      }

      if (groupIndex + 1 !== enhancedData.groupNesting) {
        return null;
      }

      if (column.renderValue) {
        value = column.renderValue(renderOptions);
      }

      return (
        <div className={join(ICSS.display.flex, ICSS.alignItems.center)}>
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
    ...groupBy.column,
  };

  if (groupColumnFromProps) {
    if (typeof groupColumnFromProps === 'function') {
      generatedGroupColumn = {
        ...generatedGroupColumn,
        ...groupColumnFromProps(options, toggleGroupRow),
      } as InfiniteTableGeneratedColumn<T>;
    } else {
      generatedGroupColumn = {
        ...generatedGroupColumn,
        ...groupColumnFromProps,
      } as InfiniteTableGeneratedColumn<T>;
    }
  }

  return generatedGroupColumn;
}

export function getSingleGroupColumn<T>(
  options: GroupColumnGetterOptions<T>,
  toggleGroupRow: (groupRowKeys: any[]) => void,
  groupColumnFromProps?: InfiniteTablePropGroupColumn<T>,
) {
  let generatedGroupColumn: InfiniteTableGeneratedColumn<T> = {
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
          className={join(ICSS.display.flex, ICSS.alignItems.center)}
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
      } as InfiniteTableGeneratedColumn<T>;
    } else {
      generatedGroupColumn = {
        ...generatedGroupColumn,
        ...groupColumnFromProps,
      } as InfiniteTableGeneratedColumn<T>;
    }
  }

  return generatedGroupColumn;
}
