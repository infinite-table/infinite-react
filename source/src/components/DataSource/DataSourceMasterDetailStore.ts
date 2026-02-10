import {
  ComponentStore,
  createComponentStore,
} from '../../utils/ComponentStore';
import { DataSourceMasterDetailContextValue } from './types';

export interface DataSourceMasterDetailStore<T>
  extends ComponentStore<DataSourceMasterDetailContextValue<T>> {}

export function createDataSourceMasterDetailStore<T>() {
  return createComponentStore<
    DataSourceMasterDetailContextValue<T>
  >() as DataSourceMasterDetailStore<T>;
}
