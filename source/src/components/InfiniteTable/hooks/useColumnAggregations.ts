import { useEffect } from 'react';

import { AggregationReducer } from '../../../utils/groupAndPivot';
import useDataSourceActions from '../../DataSource/publicHooks/useDataSourceActions';
import { useComponentState } from '../../hooks/useComponentState';
import { interceptMap } from '../../hooks/useInterceptedMap';
import { InfiniteTableComponentState } from '../types/InfiniteTableState';

export function useColumnAggregations<T>() {
  const {
    componentState: { columnAggregations },
    getComponentState,
  } = useComponentState<InfiniteTableComponentState<T>>();

  const dataSourceActions = useDataSourceActions<T>();

  useEffect(() => {
    function updateDataSourceAggregations() {
      const reducers: AggregationReducer<T, any>[] = [];

      const componentState = getComponentState();
      columnAggregations.forEach((aggregator, key) => {
        const colField = componentState.computedColumns.get(key)?.field;
        const newAggregator = {
          getter: (data: T) => (colField ? data[colField] : data),
          ...aggregator,
        };

        reducers.push(newAggregator);
      });
      dataSourceActions.aggregationReducers = reducers;
    }

    updateDataSourceAggregations();

    return interceptMap(columnAggregations, {
      clear: updateDataSourceAggregations,
      delete: updateDataSourceAggregations,
      set: updateDataSourceAggregations,
    });
  }, [columnAggregations]);
}
