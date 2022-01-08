import { useEffect } from 'react';

import { AggregationReducer } from '../../../utils/groupAndPivot';
import useDataSourceActions from '../../DataSource/publicHooks/useDataSourceActions';
import { useComponentState } from '../../hooks/useComponentState';
import { interceptMap } from '../../hooks/useInterceptedMap';
import { InfiniteTableState } from '../types/InfiniteTableState';

export function useColumnAggregations<T>() {
  const {
    componentState: { columnAggregations },
    // getComponentState,
  } = useComponentState<InfiniteTableState<T>>();

  const dataSourceActions = useDataSourceActions<T>();

  useEffect(() => {
    function updateDataSourceAggregations() {
      const reducers: AggregationReducer<T, any>[] = [];

      // const componentState = getComponentState();
      columnAggregations.forEach((aggregator, key) => {
        // const column = componentState.computedColumns.get(key);
        const field = aggregator.field;
        const newAggregator = {
          id: key,
          field: field as keyof T,
          getter: (data: T) => (field ? data[field] : data),
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
