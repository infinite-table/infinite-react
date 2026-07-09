import { h } from 'vue';

import { RowDetailCacheStorageForCurrentRow } from '../../DataSource/RowDetailCache';
import { RowDetailCacheEntry } from '../../DataSource/state/getInitialState';
import { NonUndefined } from '../../types/NonUndefined';
import { InfiniteTablePropComponents, InfiniteTableRowInfo } from '../types';

/**
 * Vue sibling of rowDetailRendererFromComponent.tsx - the RowDetail component
 * is a Vue component here, rendered via h().
 */
export function getRowDetailRendererFromComponent(
  RowDetail: NonUndefined<InfiniteTablePropComponents['RowDetail']>,
) {
  return (
    rowInfo: InfiniteTableRowInfo<any>,
    cache: RowDetailCacheStorageForCurrentRow<RowDetailCacheEntry>,
  ) => {
    return h(RowDetail as any, { key: rowInfo.id, rowInfo, cache });
  };
}
