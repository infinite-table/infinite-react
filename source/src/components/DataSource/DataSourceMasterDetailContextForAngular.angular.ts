/**
 * Angular sibling of DataSourceMasterDetailContext - the detail row provides
 * this, the (detail) DataSource injects it to know it's rendered as the
 * details of a master row.
 */
import { InjectionToken, Signal, inject, signal } from '@angular/core';

import type { InfiniteTableRowInfo } from '../InfiniteTable/types';
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

/**
 * The detail row provides the info of its master row under this token.
 */
export const INFINITE_MASTER_ROW_INFO = new InjectionToken<
  Signal<InfiniteTableRowInfo<any> | undefined>
>('INFINITE_MASTER_ROW_INFO');

const NO_MASTER_ROW_INFO: Signal<InfiniteTableRowInfo<any> | undefined> =
  signal(undefined).asReadonly();

/**
 * In an injection context inside the details of a row (a
 * `components.RowDetail` component, a `rowDetailRenderer` template, a
 * component rendered by the detail grid): the row info of the master row,
 * as a signal. Undefined outside of row details.
 *
 * The Angular equivalent of React's `useMasterRowInfo()`.
 */
export function injectMasterRowInfo<T = any>(): Signal<
  InfiniteTableRowInfo<T> | undefined
> {
  return (inject(INFINITE_MASTER_ROW_INFO, { optional: true }) ??
    NO_MASTER_ROW_INFO) as Signal<InfiniteTableRowInfo<T> | undefined>;
}
