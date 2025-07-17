import { DataSourceRowInfoReducer } from '..';
import { InfiniteTableRowInfo } from '../../InfiniteTable';

export function initRowInfoReducers<DataType>(
  reducers?: Record<string, DataSourceRowInfoReducer<DataType>>,
): Record<keyof typeof reducers, any> | undefined {
  if (!reducers) {
    return undefined;
  }
  const keys = Object.keys(reducers);
  if (!keys.length) {
    return undefined;
  }

  const result: Record<string, any> = {};

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    const initialValue = reducers[key].initialValue;
    if (initialValue !== undefined) {
      result[key] =
        typeof initialValue === 'function' ? initialValue() : initialValue;
    }
  }

  return result;
}

export function computeRowInfoReducersFor<T>(params: {
  reducers: Record<string, DataSourceRowInfoReducer<T>>;
  results: Record<keyof (typeof params)['reducers'], any>;
  reducerKeys: (keyof (typeof params)['reducers'])[];
  rowInfo: InfiniteTableRowInfo<T>;
}) {
  const keys = params.reducerKeys;
  const reducers = params.reducers;
  const results = params.results;
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    const reducer = reducers[key].reducer;
    results[key] = reducer(results[key], params.rowInfo);
  }
}

export function finishRowInfoReducersFor<T>(params: {
  reducers: Record<string, DataSourceRowInfoReducer<T>>;
  results: Record<keyof (typeof params)['reducers'], any> | undefined;

  array: InfiniteTableRowInfo<T>[];
}) {
  const keys = Object.keys(params.reducers || {});

  if (!keys.length || !params.results) {
    return params.results;
  }

  const reducers = params.reducers;
  const results = params.results;
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    const done = reducers[key].done;
    if (typeof done === 'function') {
      results[key] = done(results[key], params.array);
    }
  }

  return results;
}
