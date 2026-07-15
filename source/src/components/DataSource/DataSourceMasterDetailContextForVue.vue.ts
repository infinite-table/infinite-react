/**
 * Vue sibling of DataSourceMasterDetailContext - the detail row provides
 * this, the (detail) DataSource injects it to know it's rendered as the
 * details of a master row.
 */
import { inject, provide } from 'vue';
import type { InjectionKey } from 'vue';

import type { DataSourceMasterDetailContextValue } from './types';

export type GetMasterDetailContextForVue = () =>
  | DataSourceMasterDetailContextValue
  | undefined;

export const DataSourceMasterDetailInjectionKeyForVue: InjectionKey<GetMasterDetailContextForVue> =
  Symbol('DataSourceMasterDetail');

export function provideMasterDetailContextForVue(
  getContext: GetMasterDetailContextForVue,
) {
  provide(DataSourceMasterDetailInjectionKeyForVue, getContext);
}

const RETURN_UNDEFINED: GetMasterDetailContextForVue = () => undefined;

export function useGetMasterDetailContextForVue(): GetMasterDetailContextForVue {
  return inject(DataSourceMasterDetailInjectionKeyForVue, RETURN_UNDEFINED);
}
