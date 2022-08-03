import { DataSourceAggregationReducer } from '@infinite-table/infinite-react/components/DataSource/types';
import { DataGroupResult } from '@src/utils/groupAndPivot';

import { curry } from 'lodash';

export function getReducerValue<T>(
  data: T[],
  container: Record<string, DataSourceAggregationReducer<T, any>>,
) {
  const key = Object.keys(container)[0];
  const reducer: DataSourceAggregationReducer<T, any> = container[key];
  let value = reducer.initialValue;

  value = data.reduce((acc, item, index) => {
    const currentValue = reducer.getter
      ? reducer.getter(item)
      : reducer.field
      ? item[reducer.field]
      : null;

    return typeof reducer.reducer === 'function'
      ? reducer.reducer(acc, currentValue, item, index)
      : 0;
  }, value);

  return { [key]: reducer.done ? reducer.done(value, data) : value };
}

export function groupToItems<T>(result: DataGroupResult<T, any>) {
  return Array.from(
    Array.from(result.deepMap.topDownEntries()).reduce((map, [keys, value]) => {
      map.set(keys, value.items);
      return map;
    }, new Map<string[], T[]>()),
  );
}

export const getFilteredBy = curry(
  <T extends any>(
    data: T[],
    properties: (keyof T)[],
    ...values: T[keyof T][]
  ) => {
    return data.filter((d: T) => {
      for (var i = 0, len = values.length; i < len; i++) {
        if (d[properties[i]] !== values[i]) {
          return false;
        }
      }
      return true;
    });
  },
  3,
);
