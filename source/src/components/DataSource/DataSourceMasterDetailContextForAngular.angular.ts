/**
 * Angular sibling of DataSourceMasterDetailContext - the detail row provides
 * this, the (detail) DataSource injects it to know it's rendered as the
 * details of a master row.
 */
import { InjectionToken, inject } from '@angular/core';

import type { DataSourceMasterDetailContextValue } from './types';

export type GetMasterDetailContextForAngular = () =>
  | DataSourceMasterDetailContextValue
  | undefined;

export const INFINITE_MASTER_DETAIL_CONTEXT =
  new InjectionToken<GetMasterDetailContextForAngular>(
    'INFINITE_MASTER_DETAIL_CONTEXT',
  );

const RETURN_UNDEFINED: GetMasterDetailContextForAngular = () => undefined;

/**
 * In an injection context: the master-detail context of the closest detail
 * row, or a function returning undefined outside of one.
 */
export function injectGetMasterDetailContext(): GetMasterDetailContextForAngular {
  return (
    inject(INFINITE_MASTER_DETAIL_CONTEXT, { optional: true }) ??
    RETURN_UNDEFINED
  );
}
