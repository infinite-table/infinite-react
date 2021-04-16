import { TableComputedColumn } from '../types/TableColumn';
import {
  // DataSourceSortInfo,
  DataSourceSingleSortInfo,
} from '../../DataSource/types';
import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';

export default <T>(
  column: TableComputedColumn<T>,
): DataSourceSingleSortInfo<T> | null => {
  const { computed } = useDataSourceContextValue<T>();

  return (
    computed.sortInfo.filter(
      (sortInfo: DataSourceSingleSortInfo<T>) =>
        sortInfo.id ?? sortInfo.field === column.id,
    )[0] ?? null
  );
};
