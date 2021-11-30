import * as React from 'react';
import { join } from '../../../utils/join';
import {
  DataSourcePropGroupRowsBy,
  DataSourcePropPivotBy,
} from '../../DataSource';
import { ExpanderIcon } from '../components/icons/ExpanderIcon';
import { GroupRowExpanderCls } from '../components/InfiniteTableRow/row.css';
import { InfiniteTableProps } from '../types';
import { InfiniteTablePivotColumn } from '../types/InfiniteTableColumn';
import { InfiniteTableState } from '../types/InfiniteTableState';
import { display, alignItems, cssEllipsisClassName } from '../utilities.css';

export function getComputedPivotColumnsFromDataSourcePivotColumns<T>(
  pivotColumns: InfiniteTableProps<T>['pivotColumns'],
  params: {
    toggleGroupRow: (groupKeys: any[]) => void;
    pivotColumn: InfiniteTableProps<T>['pivotColumn'];
    pivotRowLabelsColumn: InfiniteTableProps<T>['pivotRowLabelsColumn'];
    pivotTotalColumnPosition: InfiniteTableState<T>['pivotTotalColumnPosition'];
    pivotBy: DataSourcePropPivotBy<T>;
    groupRowsBy: DataSourcePropGroupRowsBy<T>;
  },
): InfiniteTableProps<T>['pivotColumns'] {
  if (!pivotColumns) {
    return undefined;
  }

  const {
    pivotColumn,
    pivotRowLabelsColumn,
    pivotBy,
    groupRowsBy,
    pivotTotalColumnPosition,
    toggleGroupRow,
  } = params;

  const computedPivotColumns = new Map();

  pivotColumns.forEach((col, key) => {
    if (col.pivotTotalColumn && pivotTotalColumnPosition === false) {
      // don't include the total columns if specified as false
      return;
    }

    let column: InfiniteTablePivotColumn<T> = { ...col };

    if (pivotColumn) {
      if (typeof pivotColumn === 'function') {
        column = {
          ...column,
          ...pivotColumn({
            column,
            pivotBy,
            groupRowsBy,
          }),
        } as InfiniteTablePivotColumn<T>;
      } else {
        column = {
          ...column,
          ...pivotColumn,
        } as InfiniteTablePivotColumn<T>;
      }
    }

    const isPivotRowLabelsColumn =
      !column.pivotColumn && !column.pivotTotalColumn;

    if (pivotRowLabelsColumn && isPivotRowLabelsColumn) {
      if (typeof pivotRowLabelsColumn === 'function') {
        column = {
          ...column,
          ...pivotRowLabelsColumn({
            column,
            pivotBy,
            groupRowsBy,
          }),
        } as InfiniteTablePivotColumn<T>;
      } else {
        column = {
          ...column,
          ...pivotRowLabelsColumn,
        } as InfiniteTablePivotColumn<T>;
      }
    }

    if (isPivotRowLabelsColumn && !column.render) {
      column.render = (renderOptions) => {
        let { value, rowInfo, column, groupRowsBy } = renderOptions;

        if (column.renderValue) {
          value = column.renderValue(renderOptions);
        }

        const showExpanderIcon =
          (rowInfo.groupKeys?.length || 0) < groupRowsBy.length;
        return (
          <div
            className={join(
              display.flex,
              alignItems.center,
              GroupRowExpanderCls,
            )}
          >
            {showExpanderIcon ? (
              <ExpanderIcon
                expanded={!rowInfo.collapsed}
                onChange={() => {
                  toggleGroupRow(rowInfo.groupKeys!);
                }}
              />
            ) : null}
            <div className={cssEllipsisClassName}>{value ?? null}</div>
          </div>
        );
      };
    }

    if (!column.render && column.renderValue) {
      column.render = (renderOptions) => {
        return column.renderValue!(renderOptions);
      };
    }
    computedPivotColumns.set(key, column);
  });

  return computedPivotColumns;
}
