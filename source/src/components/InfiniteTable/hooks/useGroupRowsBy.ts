import { useCallback, useEffect } from 'react';
import { GroupRowsState } from '../../DataSource';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { useComponentState } from '../../hooks/useComponentState';
import { InfiniteTableGeneratedColumns } from '../types/InfiniteTableProps';
import { InfiniteTableComponentState } from '../types/InfiniteTableState';
import { getColumnForGroupBy } from '../utils/getColumnForGroupBy';

export function useGroupRowsBy<T>() {
  const {
    componentState: { groupRowsBy },
    getState: getDataSourceState,
    componentActions: dataSourceActions,
  } = useDataSourceContextValue<T>();

  const {
    componentActions,
    componentState: { groupColumn },
  } = useComponentState<InfiniteTableComponentState<T>>();

  const toggleGroupRow = useCallback((groupKeys: any[]) => {
    const newState = new GroupRowsState(getDataSourceState().groupRowsState);
    newState.toggleGroupRow(groupKeys);

    dataSourceActions.groupRowsState = newState;
  }, []);

  useEffect(() => {
    const generatedColumns: InfiniteTableGeneratedColumns<T> = new Map();

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

    componentActions.generatedColumns = generatedColumns;
  }, [groupRowsBy, groupColumn]);
}
