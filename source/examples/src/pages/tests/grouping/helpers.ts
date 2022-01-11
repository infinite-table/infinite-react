import { DataSourceAggregationReducer } from '@infinite-table/infinite-react';
import { DataGroupResult } from '@src/utils/groupAndPivot';

import { curry } from 'lodash';

export function getReducerValue<T>(
  data: T[],
  reducer: DataSourceAggregationReducer<T, any>,
) {
  let value = reducer.initialValue;

  value = data.reduce((acc, item) => {
    const currentValue = reducer.getter
      ? reducer.getter(item)
      : reducer.field
      ? item[reducer.field]
      : null;

    return reducer.reducer(acc, currentValue, item);
  }, value);

  return reducer.done ? reducer.done(value, data) : value;
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
