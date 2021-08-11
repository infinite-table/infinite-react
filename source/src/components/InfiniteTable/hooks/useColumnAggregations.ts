import { useEffect } from 'react';
import { AggregationReducer } from '../../../utils/groupAndPivot';
import useDataSourceActions from '../../DataSource/publicHooks/useDataSourceActions';
import { useLatest } from '../../hooks/useLatest';
import useProperty from '../../hooks/usePropertyOld'; //TODO change this
import { Setter } from '../../types/Setter';
import {
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumnAggregations,
} from '../types/InfiniteTableProps';

import { useInternalInfiniteTable } from './useInternalInfiniteTable';

export function useColumnAggregations<T>(): [
  InfiniteTablePropColumnAggregations<T>,
  Setter<InfiniteTablePropColumnAggregations<T> | undefined>,
] {
  const { props, state, actions, getComputed } = useInternalInfiniteTable<T>();

  const [columnAggregations, setColumnAggregations] = useProperty(
    'columnAggregations',
    props,
    {
      defaultValue: new Map<string, InfiniteTableColumnAggregator<T, any>>([]),
      fromState: () => state.columnAggregations,
      setState: (columnAggregations) =>
        actions.setColumnAggregations(columnAggregations),
    },
  );

  const dataSourceActions = useDataSourceActions<T>();
  const getDataSourceActions = useLatest(dataSourceActions);

  useEffect(() => {
    function updateDataSourceAggregations() {
      const reducers: AggregationReducer<T, any>[] = [];
      columnAggregations.forEach((aggregator, key) => {
        const colField = getComputed()!.columns.get(key)?.field;
        const newAggregator = {
          getter: (data: T) => (colField ? data[colField] : data),
          ...aggregator,
        };

        reducers.push(newAggregator);
      });
      getDataSourceActions().setAggregationReducers(reducers);
    }

    const set = columnAggregations.set.bind(columnAggregations);
    const deleteKey = columnAggregations.delete.bind(columnAggregations);
    const clear = columnAggregations.clear.bind(columnAggregations);

    columnAggregations.set = (
      key: any,
      aggregator: InfiniteTableColumnAggregator<T, any>,
    ) => {
      const result = set(key, aggregator);
      updateDataSourceAggregations();
      return result;
    };
    columnAggregations.delete = (key: any) => {
      const removed = deleteKey(key);
      updateDataSourceAggregations();
      return removed;
    };
    columnAggregations.clear = () => {
      clear();
      updateDataSourceAggregations();
    };

    updateDataSourceAggregations();

    return () => {
      columnAggregations.set = set;
      columnAggregations.delete = deleteKey;
      columnAggregations.clear = clear;
    };
  }, [columnAggregations]);

  return [columnAggregations, setColumnAggregations];
}
