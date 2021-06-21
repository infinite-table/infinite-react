import { InfiniteTableComputedColumn } from '../types/InfiniteTableColumn';
import {
  // DataSourceSortInfo,
  DataSourceSingleSortInfo,
} from '../../DataSource/types';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';

export default <T>(
  column: InfiniteTableComputedColumn<T>,
): DataSourceSingleSortInfo<T> | null => {
  const { computed } = useDataSourceContextValue<T>();

  return (
    computed.sortInfo.filter(
      (sortInfo: DataSourceSingleSortInfo<T>) =>
        sortInfo.id ?? sortInfo.field === column.id,
    )[0] ?? null
  );
};
