import * as React from 'react';

import { RowDetailCacheStorageForCurrentRow } from '../../DataSource/RowDetailCache';
import { RowDetailCacheEntry } from '../../DataSource/state/getInitialState';
import { NonUndefined } from '../../types/NonUndefined';
import { InfiniteTablePropComponents, InfiniteTableRowInfo } from '../types';

export function getRowDetailRendererFromComponent(
  RowDetail: NonUndefined<InfiniteTablePropComponents['RowDetail']>,
) {
  return (
    rowInfo: InfiniteTableRowInfo<any>,
    cache: RowDetailCacheStorageForCurrentRow<RowDetailCacheEntry>,
  ) => {
    return <RowDetail key={rowInfo.id} rowInfo={rowInfo} cache={cache} />;
  };
}
