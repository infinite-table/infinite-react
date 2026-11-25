import { RowDetailCacheStorageForCurrentRow } from '../../DataSource/RowDetailCache';
import { RowDetailCacheEntry } from '../../DataSource/state/getInitialState';
import { NonUndefined } from '../../types/NonUndefined';
import { InfiniteTablePropComponents, InfiniteTableRowInfo } from '../types';

/**
 * Angular sibling of rowDetailRendererFromComponent.tsx - `components.RowDetail`
 * is an Angular component here; it gets `rowInfo` and `cache` as inputs
 * (and can inject the master row info).
 */
export function getRowDetailRendererFromComponent(
  RowDetail: NonUndefined<InfiniteTablePropComponents['RowDetail']>,
) {
  return (
    rowInfo: InfiniteTableRowInfo<any>,
    cache: RowDetailCacheStorageForCurrentRow<RowDetailCacheEntry>,
  ) => {
    return {
      kind: 'component' as const,
      component: RowDetail as any,
      inputs: { rowInfo, cache },
    };
  };
}
