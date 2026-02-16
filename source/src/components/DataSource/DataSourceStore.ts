import {
  ComponentStore,
  createComponentStore,
} from '../../utils/ComponentStore';
import type { DataSourceContextValue } from './types';

export interface DataSourceStore<T>
  extends ComponentStore<DataSourceContextValue<T>> {}

export function createDataSourceStore<T>() {
  return createComponentStore<
    DataSourceContextValue<T>
  >() as DataSourceStore<T>;
}
