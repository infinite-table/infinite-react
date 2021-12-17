import type { InfiniteTableColumn } from '../types';
import type {
  InfiniteTableColumnType,
  InfiniteTablePropColumnTypesMap,
} from '../types/InfiniteTableProps';

const emptyType: InfiniteTableColumnType<any> = Object.freeze({});

export function getColumnComputedType<T>(
  column: InfiniteTableColumn<T>,
  columnTypes: InfiniteTablePropColumnTypesMap<T>,
): InfiniteTableColumnType<T> {
  const defaultType: InfiniteTableColumnType<T> =
    columnTypes.get('default') || emptyType;

  if (column.type === undefined) {
    return defaultType;
  }
  if (column.type === null) {
    return emptyType;
  }
  if (typeof column.type === 'string') {
    const type = columnTypes.get(column.type) || emptyType;

    return type;
  }
  return column.type.reduce(
    (acc, columnType) => Object.assign(acc, columnTypes.get(columnType)),
    {} as InfiniteTableColumnType<T>,
  );
}
