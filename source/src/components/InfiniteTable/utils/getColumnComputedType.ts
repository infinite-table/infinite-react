import type { InfiniteTableColumn } from '../types';
import type {
  InfiniteTableColumnType,
  InfiniteTablePropColumnTypes,
} from '../types/InfiniteTableProps';

const emptyType: InfiniteTableColumnType<any> = Object.freeze({});

export function getColumnComputedType<T>(
  column: InfiniteTableColumn<T>,
  columnTypes: InfiniteTablePropColumnTypes<T>,
): InfiniteTableColumnType<T> {
  const defaultType: InfiniteTableColumnType<T> =
    columnTypes['default'] || emptyType;

  if (column.type === undefined) {
    return defaultType;
  }
  if (column.type === null) {
    return emptyType;
  }
  if (typeof column.type === 'string') {
    const type = columnTypes[column.type] || emptyType;

    return type;
  }
  return column.type.reduce(
    (acc, columnType) => Object.assign(acc, columnTypes[columnType]),
    {} as InfiniteTableColumnType<T>,
  );
}
