import * as React from 'react';
import { InfiniteTableColumnRenderParam } from '..';
import { cssEllipsisClassName } from '../../../style/css';
import { ICSS } from '../../../style/utilities';
import { join } from '../../../utils/join';
import { DataSourceGroupRowsBy } from '../../DataSource';
import { ExpanderIcon } from '../components/icons/ExpanderIcon';

import { InfiniteTableGeneratedGroupColumn } from '../types/InfiniteTableColumn';
import {
  GroupColumnGetterOptions,
  InfiniteTablePropGroupColumn,
  InfiniteTablePropGroupRenderStrategy,
} from '../types/InfiniteTableProps';

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

    let collapsed = false;
    let groupKeys = enhancedData.groupKeys!;

    if (groupRenderStrategy !== 'inline') {
      collapsed = enhancedData.collapsed;
    } else {
      const field = column.field;
      let current = enhancedData;
      let parents = enhancedData.parents;

      let len = parents!.length - 1;
      if (!current) {
        return null;
      }
      while (
        current &&
        current.groupBy![current.groupBy!.length - 1] != (field as string)
      ) {
        current = parents![len];
        len--;
        if (!current) {
          return null;
        }
      }
      groupKeys = current.groupKeys!;
      collapsed = current.collapsed;
    }

    if (groupRenderStrategy === 'inline') {
      if (!enhancedData.isGroupRow && enhancedData.groupCount === 1) {
        return value;
      }
    } else {
      if (!enhancedData.isGroupRow) {
        return null;
      }

      if (groupIndex + 1 !== enhancedData.groupNesting) {
        return null;
      }
    }

    return (
      <div className={join(ICSS.display.flex, ICSS.alignItems.center)}>
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
