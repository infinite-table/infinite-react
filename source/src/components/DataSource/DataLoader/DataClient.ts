import { DeepMap } from '../../../utils/DeepMap';

import {
  DataQuery,
  DataQueryFn,
  DataQueryKey,
  DataQueryKeyStringified,
  DataQuerySnapshot,
} from './DataQuery';

type QueryOptions = {
  fn: DataQueryFn;
  key: DataQueryKey[];
  name?: string;
};

export function queryKeyToCacheKey(key: DataQueryKey): any {
  if (Array.isArray(key)) {
    return key.map(queryKeyToCacheKey);
  }

  if (typeof key === 'object') {
    if (key === null) {
      return key;
    }

    const current = key as Record<string, any>;
    const keys = Object.keys(current).sort((a, b) => a.localeCompare(b));
    const result: Record<string, any> = {};

    keys.forEach((k) => {
      const value = current[k];
      if (value !== undefined) {
        result[k] = queryKeyToCacheKey(value);
      }
    });

    return JSON.stringify(result);
  }
  if ((key as any) instanceof Date) {
    return (key as any as Date).toISOString();
  }

  return key;
}

export class DataClient {
  private options: DataClientOptions;

  private queryCache: DeepMap<DataQueryKeyStringified, DataQuery> =
    new DeepMap();

  static clients: Map<string, DataClient> = new Map();
  private name: string;

  static destroy(clientName: string) {
    const client = DataClient.clients.get(clientName);
    if (client) {
      client.destroy();
    }
  }

  static destroyAll() {
    DataClient.clients.forEach((client) => {
      DataClient.destroy(client.name);
    });
  }

  constructor(options: DataClientOptions) {
    this.options = options;

    if (DataClient.clients.has(options.name)) {
      const errMsg = `There's already a DataClient with name "${options.name}". Specify a different name for the client`;
      throw new Error(errMsg);
    }

    DataClient.clients.set(options.name, this);
    this.name = options.name;
  }

  private removeQueryIfErrored = (
    query: DataQuery,
    stringifiedQueryKey: DataQueryKeyStringified[],
  ) => {
    if (query.getCurrentSnapshot().state !== 'success') {
      const currentCachedQuery = this.queryCache.get(stringifiedQueryKey);

      if (query === currentCachedQuery) {
        this.queryCache.delete(stringifiedQueryKey);
        return true;
      }
    }

    return false;
  };

  private fireQuery = (options: QueryOptions) => {
    const stringifiedCacheKey = queryKeyToCacheKey(
      options.key,
    ) as DataQueryKeyStringified[];
    const cachedQuery = this.options.cache
      ? this.queryCache.get(stringifiedCacheKey)
      : null;

    if (cachedQuery != null) {
      // we already have a cache in progress for the same key
      // so let's use it
      const currentSnapshot = cachedQuery.getCurrentSnapshot();

      // we waited for the query to finish
      if (currentSnapshot.state === 'success') {
        // if all went well, we can return the result
        return { query: cachedQuery, fromCache: true };
      }
      if (currentSnapshot.state === 'loading') {
        return { query: cachedQuery, fromCache: true };
      }
      if (currentSnapshot.state === 'error') {
        this.removeQueryIfErrored(cachedQuery, stringifiedCacheKey);
      }
      // otherwise continue with the initial query
    }
    const dataQuery = new DataQuery(`${this.name}:${options.name}`);
    this.queryCache.set(stringifiedCacheKey, dataQuery);

    dataQuery.fetch(options.fn, options.key);
    dataQuery.getCurrentSnapshot().promise?.then(() => {
      this.removeQueryIfErrored(dataQuery, stringifiedCacheKey);
    });

    return { query: dataQuery, fromCache: false };
  };

  query = (options: QueryOptions): DataQuerySnapshot => {
    return this.fireQuery(options).query.getCurrentSnapshot();
  };

  awaitQuery = async (options: QueryOptions): Promise<DataQuerySnapshot> => {
    // if there is a cached query in progress
    // that one will be returned here
    const { query, fromCache } = this.fireQuery(options);
    let snapshot = query.getCurrentSnapshot();

    if (snapshot.promise) {
      snapshot = await query.getDoneSnapshot();

      // if it was a cached query, and it errored
      // make sure we retry the query
      if (snapshot.state === 'error' && fromCache) {
        return await this.fireQuery(options).query.getDoneSnapshot();
      }
    }

    return snapshot;
  };

  isQueryInProgress = (key: DataQueryKey[]) => {
    const stringifiedCacheKey = queryKeyToCacheKey(
      key,
    ) as DataQueryKeyStringified[];

    const cachedQuery = this.queryCache.get(stringifiedCacheKey);

    return cachedQuery?.getCurrentSnapshot().done ?? false;
  };

  hasQueryForKey = (key: DataQueryKey[]) => {
    const stringifiedCacheKey = queryKeyToCacheKey(
      key,
    ) as DataQueryKeyStringified[];

    return this.queryCache.has(stringifiedCacheKey);
  };

  discardQueryForKey = (key: DataQueryKey[]) => {
    const stringifiedCacheKey = queryKeyToCacheKey(
      key,
    ) as DataQueryKeyStringified[];

    this.queryCache.delete(stringifiedCacheKey);
  };

  destroy() {
    DataClient.clients.delete(this.options.name);
  }
}

type DataClientOptions = {
  name: string;
  cache?: boolean;
  // staleTime?: number; // TODO implement this
  // retryCount?: number; // TODO implement this
};
