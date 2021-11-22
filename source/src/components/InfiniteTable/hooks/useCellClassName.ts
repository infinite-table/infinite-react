import { InfiniteTableComputedColumn } from '../types';

type CellClassNameWithVariants = {
  first: string;
  groupByField: string;
  last: string;
  firstInCategory: string;
  lastInCategory: string;
  pinnedStart: string;
  pinnedEnd: string;
  unpinned: string;
};
export function useCellClassName<T>(
  column: InfiniteTableComputedColumn<T>,
  baseClasses: string[],
  variants: CellClassNameWithVariants[],
) {
  const result = [...baseClasses];
  //TODO implement this with new approach
  if (column.computedFirst) {
    result.push(
      ...baseClasses.map((c) => `${c}--first`),
      ...variants.map((v) => v.first),
    );
  }

  if (column.groupByField) {
    result.push(
      ...baseClasses.map((c) => `${c}--group-column`),
      ...variants.map((v) => v.groupByField),
    );
  }
  if (column.computedLast) {
    result.push(
      ...baseClasses.map((c) => `${c}--last`),
      ...variants.map((v) => v.last),
    );
  }
  if (column.computedFirstInCategory) {
    result.push(
      ...baseClasses.map((c) => `${c}--first-in-category`),
      ...variants.map((v) => v.firstInCategory),
    );
  }
  if (column.computedLastInCategory) {
    result.push(
      ...baseClasses.map(
        (c) => `${c}--last-in-category`,
        ...variants.map((v) => v.lastInCategory),
      ),
    );
  }
  if (column.computedPinned) {
    result.push(
      ...baseClasses.map((c) => `${c}--pinned-${column.computedPinned}`),
      ...variants.map((v) =>
        column.computedPinned === 'start' ? v.pinnedStart : v.pinnedEnd,
      ),
    );
  } else {
    result.push(
      ...baseClasses.map((c) => `${c}--unpinned`),
      ...variants.map((v) => v.unpinned),
    );
  }

  return result.filter(Boolean).join(' ');
}
