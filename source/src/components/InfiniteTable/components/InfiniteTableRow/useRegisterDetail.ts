import {
  DataSourceState,
  RowDetailCache,
  useDataSourceSelector,
} from '../../../../components/DataSource';
import { useMemo } from 'react';

import { InfiniteTableRowInfo } from '../../types';
import { useInfiniteTableSelector } from '../../hooks/useInfiniteTableSelector';
import {
  createCurrentRowCache,
  createMasterDetailContextValue,
} from './registerDetailShared';

type UseRegisterDetailProps<T> = {
  rowDetailsCache: RowDetailCache;
  rowInfo: InfiniteTableRowInfo<T>;
};

export function useRegisterDetail<T>(props: UseRegisterDetailProps<T>) {
  const { rowDetailsCache, rowInfo } = props;
  const {
    getDataSourceState: getMasterDataSourceState,
    dataSourceActions: masterActions,
  } = useDataSourceSelector((ctx) => {
    return {
      getDataSourceState: ctx.getDataSourceState as () => DataSourceState<T>,
      dataSourceActions: ctx.dataSourceActions,
    };
  });

  const { getMasterState } = useInfiniteTableSelector((ctx) => {
    return {
      getMasterState: ctx.getState,
    };
  });

  const { currentRowCache, cacheCalledByRowDetailRenderer } = useMemo(
    () => createCurrentRowCache(rowInfo.id, rowDetailsCache),
    [rowDetailsCache, rowInfo.id],
  );

  const masterDetailContextValue = useMemo(() => {
    return createMasterDetailContextValue<T>({
      rowInfo,
      currentRowCache,
      cacheCalledByRowDetailRenderer,
      getMasterDataSourceState,
      masterActions,
      getMasterState,
    });
  }, [rowInfo.id, currentRowCache]);

  // keep these fresh on every render (same as before the extraction)
  masterDetailContextValue.masterRowInfo = rowInfo;
  masterDetailContextValue.getMasterDataSourceState = getMasterDataSourceState;
  masterDetailContextValue.getMasterState = getMasterState;

  return { masterDetailContextValue, currentRowCache };
}
