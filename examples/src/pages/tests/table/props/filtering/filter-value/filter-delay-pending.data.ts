import type { DataSourceFilterValueItem } from '@infinite-table/infinite-react';

export type Developer = {
  id: number;
  firstName: string;
  stack: string;
};

export const developers: Developer[] = [
  { id: 1, firstName: 'John', stack: 'frontend' },
  { id: 2, firstName: 'Jane', stack: 'backend' },
  { id: 3, firstName: 'Jack', stack: 'frontend' },
  { id: 4, firstName: 'Jill', stack: 'backend' },
  { id: 5, firstName: 'Seb', stack: 'frontend' },
];

export const columns = {
  firstName: { field: 'firstName' as const },
  stack: { field: 'stack' as const },
};

// long enough for the spec to write the filter before it elapses
export const FILTER_DELAY = 400;

export const domProps = { style: { height: '80vh' } };

/**
 * Records the filter values the DataSource reports in
 * `globalThis.filterValueChanges` (as `field:value` strings).
 */
export function recordFilterValueChange(
  filterValue: DataSourceFilterValueItem<Developer>[] | undefined,
) {
  const changes = ((globalThis as any).filterValueChanges ??= []);
  changes.push(
    (filterValue ?? []).map((item) => `${item.field}:${item.filter.value}`),
  );
}
