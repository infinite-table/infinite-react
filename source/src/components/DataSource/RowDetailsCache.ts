import { FixedSizeMap } from '../../utils/FixedSizeMap';

import {
  RowDetailsCacheEntry,
  RowDetailsCacheKey,
} from './state/getInitialState';

interface RowDetailsCacheStorage<_K, T> {
  add(key: any, value: T): void;
  get(key: any): T | undefined;
  delete(key: any): void;
  has(key: any): boolean;
}

export interface RowDetailsCacheStorageForCurrentRow<T = RowDetailsCacheEntry> {
  add(value: T): void;
  get(): T | undefined;
  delete(): void;
  has(): boolean;
}

class RowDetailsNoCacheStorage<K, T> implements RowDetailsCacheStorage<K, T> {
  add(_key: any, _value: T): void {
    return;
  }
  get(_key: any): T | undefined {
    return undefined;
  }
  delete(_key: any): void {
    return;
  }
  has(_key: any): boolean {
    return false;
  }
}

class RowDetailsFixedSizeCacheStorage<K, T>
  implements RowDetailsCacheStorage<K, T>
{
  private storage: FixedSizeMap<K, T>;

  constructor(maxSize: number) {
    this.storage = new FixedSizeMap(maxSize);
  }

  add(key: K, value: T): void {
    this.storage.set(key, value);
  }
  get(key: K): T | undefined {
    return this.storage.get(key);
  }
  delete(key: K): void {
    this.storage.delete(key);
  }
  has(key: K): boolean {
    return this.storage.has(key);
  }
}

class RowDetailsFullCacheStorage<K, T> implements RowDetailsCacheStorage<K, T> {
  private storage: Map<K, T>;

  constructor() {
    this.storage = new Map();
  }

  add(key: K, value: T): void {
    this.storage.set(key, value);
  }
  get(key: K): T | undefined {
    return this.storage.get(key);
  }
  delete(key: K): void {
    this.storage.delete(key);
  }
  has(key: K): boolean {
    return this.storage.has(key);
  }
}

// let INSTANCE_COUNTER = 0;
// globalThis.RowDetailsCacheInstances = [];

export class RowDetailsCache<K = RowDetailsCacheKey, T = RowDetailsCacheEntry>
  implements RowDetailsCacheStorage<K, T>
{
  private cacheStorage: RowDetailsCacheStorage<K, T>;

  // public instanceIndex: number = 0;

  constructor(cache?: boolean | number) {
    // this.instanceIndex = INSTANCE_COUNTER++;
    // globalThis.RowDetailsCacheInstances.push(this);
    this.cacheStorage =
      cache === false
        ? new RowDetailsNoCacheStorage()
        : cache === true
        ? new RowDetailsFullCacheStorage()
        : typeof cache === 'number'
        ? new RowDetailsFixedSizeCacheStorage(cache)
        : new RowDetailsFixedSizeCacheStorage(5);
  }

  add(key: K, value: T): void {
    this.cacheStorage.add(key, value);
  }
  get(key: K): T | undefined {
    return this.cacheStorage.get(key);
  }
  delete(key: K): void {
    this.cacheStorage.delete(key);
  }
  has(key: K): boolean {
    return this.cacheStorage.has(key);
  }
}
