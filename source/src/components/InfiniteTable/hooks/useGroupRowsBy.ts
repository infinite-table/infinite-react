import { useCallback, useEffect } from 'react';
import { DataSourceGroupRowsBy, GroupRowsState } from '../../DataSource';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useComponentState } from '../../hooks/useComponentState';
import {
  InfiniteTableGeneratedColumns,
  InfiniteTablePropGroupColumn,
  InfiniteTablePropGroupRenderStrategy,
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

export function useGroupRowsBy<T>() {
  const {
    componentState: { groupRowsBy },
    getState: getDataSourceState,
    componentActions: dataSourceActions,
  } = useDataSourceContextValue<T>();

  const {
    componentActions,
    componentState: { groupColumn, groupRenderStrategy },
  } = useComponentState<InfiniteTableComponentState<T>>();

  const toggleGroupRow = useCallback((groupKeys: any[]) => {
    const newState = new GroupRowsState(getDataSourceState().groupRowsState);
    newState.toggleGroupRow(groupKeys);

    dataSourceActions.groupRowsState = newState;
  }, []);

  useEffect(() => {
    const generatedColumns: InfiniteTableGeneratedColumns<T> = new Map();

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

    componentActions.generatedColumns = generatedColumns;
  }, [groupRowsBy, groupColumn, groupRenderStrategy]);
}
