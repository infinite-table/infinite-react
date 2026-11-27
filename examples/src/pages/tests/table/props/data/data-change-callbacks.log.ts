import type { DataSourceApi } from '@infinite-table/infinite-react';

export type Row = {
  id: number;
  firstName: string;
};

export const rows: Row[] = [
  { id: 1, firstName: 'John' },
  { id: 2, firstName: 'Marry' },
  { id: 3, firstName: 'Bill' },
];

export const columns = {
  id: { field: 'id' as const },
  firstName: { field: 'firstName' as const },
};

export const domProps = { style: { height: '200px' } };

export type DataKind = 'array' | 'promise' | 'fn';

/**
 * The DataSource callbacks of the three grids of the page (array, promise
 * and function data), recorded in the order they are called, in
 * `globalThis.dataChangeLog`. `globalThis.dataSourceApis` has the APIs.
 */
export function createDataChangeLog() {
  const log: Record<DataKind, unknown[][]> = { array: [], promise: [], fn: [] };
  const apis: Partial<Record<DataKind, DataSourceApi<Row>>> = {};
  (globalThis as any).dataChangeLog = log;
  (globalThis as any).dataSourceApis = apis;

  const handlersFor = (kind: DataKind) => ({
    onDataArrayChange: (
      dataArray: Row[],
      info: { timestamp: number; mutations?: Map<string, unknown[]> },
    ) => {
      log[kind].push([
        'dataArrayChange',
        dataArray.map((row) => row.id),
        typeof info.timestamp,
        info.mutations ? info.mutations.size : null,
      ]);
    },
    onDataMutations: (params: { mutations: Map<string, unknown[]> }) => {
      log[kind].push(['dataMutations', params.mutations.size]);
    },
    onReady: (api: DataSourceApi<Row>) => {
      log[kind].push(['ready']);
      apis[kind] = api;
    },
  });

  return {
    handlers: {
      array: handlersFor('array'),
      promise: handlersFor('promise'),
      fn: handlersFor('fn'),
    },
    data: {
      array: rows,
      promise: Promise.resolve(rows),
      fn: () => {
        log.fn.push(['data']);
        return Promise.resolve(rows);
      },
    },
  };
}
