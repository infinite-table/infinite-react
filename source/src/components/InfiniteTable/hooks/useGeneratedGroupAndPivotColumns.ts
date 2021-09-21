import { useCallback, useEffect } from 'react';
import { DataSourceGroupRowsBy, GroupRowsState } from '../../DataSource';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useComponentState } from '../../hooks/useComponentState';
import { getComputedPivotColumnsFromDataSourcePivotColumns } from '../state/getComputedPivotColumnsFromDataSourcePivotColumns';
import {
  InfiniteTableGeneratedColumns,
  InfiniteTablePropGroupColumn,
  InfiniteTablePropGroupRenderStrategy,
  InfiniteTableProps,
} from '../types/InfiniteTableProps';
import { InfiniteTableComponentState } from '../types/InfiniteTableState';
import {
  getColumnForGroupBy,
  getSingleGroupColumn,
} from '../utils/getColumnForGroupBy';

type GetGroupColumnStrategyOptions<T> = {
  groupRowsBy: DataSourceGroupRowsBy<T>[];
  groupColumn?: InfiniteTablePropGroupColumn<T>;
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
};
function getGroupRenderStrategy<T>(
  options: GetGroupColumnStrategyOptions<T>,
): InfiniteTablePropGroupRenderStrategy {
  const { groupRowsBy, groupColumn, groupRenderStrategy } = options;

  if (groupRenderStrategy) {
    return groupRenderStrategy;
  }

  if (groupColumn != null && typeof groupColumn === 'object') {
    return 'single-column';
  }

  const columnsInGroupRowsBy = groupRowsBy.filter((g) => g.column);

  if (columnsInGroupRowsBy.length) {
    return 'multi-column';
  }

  return 'multi-column';
}

export function useGeneratedGroupAndPivotColumns<T>() {
  const {
    componentState: { groupRowsBy, pivotBy },
    getState: getDataSourceState,
    componentActions: dataSourceActions,
  } = useDataSourceContextValue<T>();

  const {
    getComponentState,
    componentActions,
    componentState: {
      groupColumn,
      groupRenderStrategy,
      pivotColumn,
      pivotRowLabelsColumn,
      pivotColumns,
      pivotTotalColumnPosition,
    },
  } = useComponentState<InfiniteTableComponentState<T>>();

  const toggleGroupRow = useCallback((groupKeys: any[]) => {
    const newState = new GroupRowsState(getDataSourceState().groupRowsState);
    newState.toggleGroupRow(groupKeys);

    dataSourceActions.groupRowsState = newState;
  }, []);

  useEffect(() => {
    const currentState = getComponentState();

    if (pivotColumns) {
      if (currentState.generatedColumns.size) {
        //reset generated columns
        componentActions.generatedColumns = new Map();
      }

      return;
    }

    componentActions.generatedColumns = getGeneratedGroupColumns({
      groupColumn,
      groupRenderStrategy,
      groupRowsBy,
      pivotColumns,
      toggleGroupRow,
    });
  }, [groupRowsBy, groupColumn, groupRenderStrategy, pivotColumns]);

  useEffect(() => {
    dataSourceActions.pivotTotalColumnPosition = pivotTotalColumnPosition;
  }, [pivotTotalColumnPosition]);

  useEffect(() => {
    const computedPivotColumns =
      getComputedPivotColumnsFromDataSourcePivotColumns(pivotColumns, {
        pivotColumn,
        pivotRowLabelsColumn,
        pivotTotalColumnPosition,
        pivotBy: pivotBy!,

        groupRowsBy,
        toggleGroupRow,
      });

    componentActions.computedPivotColumns = computedPivotColumns;
  }, [pivotColumns, pivotColumn, pivotRowLabelsColumn]);
}

export function getGeneratedGroupColumns<T>(params: {
  groupRowsBy: DataSourceGroupRowsBy<T>[];
  toggleGroupRow: (groupKeys: any[]) => void;
  groupColumn: InfiniteTableProps<T>['groupColumn'];
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  pivotColumns: InfiniteTableProps<T>['pivotColumns'];
}): InfiniteTableGeneratedColumns<T> {
  const {
    pivotColumns,
    groupRowsBy,
    groupColumn,
    groupRenderStrategy,
    toggleGroupRow,
  } = params;

  const generatedColumns: InfiniteTableGeneratedColumns<T> = new Map();

  if (pivotColumns) {
    return generatedColumns;
  }

  const strategy = getGroupRenderStrategy({
    groupRowsBy,
    groupColumn,
    groupRenderStrategy,
  });

  if (groupRenderStrategy === 'multi-column') {
    groupRowsBy.forEach((groupBy, index, arr) => {
      generatedColumns.set(
        `group-by-${groupBy.field}`,
        getColumnForGroupBy<T>(
          { groupBy, groupRowsBy, groupIndex: index, groupCount: arr.length },
          toggleGroupRow,
          groupColumn,
        ),
      );
    });
  } else if (strategy === 'single-column') {
    generatedColumns.set(
      'group-by',
      getSingleGroupColumn(
        {
          groupCount: groupRowsBy.length,
          groupRowsBy,
        },
        toggleGroupRow,
        groupColumn,
      ),
    );
  }

  return generatedColumns;
}
