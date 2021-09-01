import { useEffect } from 'react';
import { useDataSource } from '../../DataSource';
import { InfiniteTablePropColumns } from '../types/InfiniteTableProps';
import { getColumnForGroupBy } from '../utils/getColumnForGroupBy';

export function useGroupRowsBy<T>() {
  const { groupRowsBy } = useDataSource();

  useEffect(() => {
    const generatedColumns: InfiniteTablePropColumns<T> = new Map();

    groupRowsBy.forEach((groupBy) => {
      generatedColumns.set(
        `--group-col-${groupBy.field}`,
        getColumnForGroupBy<T>(groupBy),
      );
    });
  }, [groupRowsBy]);
}
