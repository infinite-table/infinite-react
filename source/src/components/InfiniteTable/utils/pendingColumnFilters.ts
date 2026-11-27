import type {
  DataSourceFilterValueItem,
  DataSourceState,
} from '../../DataSource/types';
import type { InfiniteTableApi } from '../types/InfiniteTableProps';
import type {
  InfiniteTableComputedColumn,
  InfiniteTableComputedValues,
} from '../types';
import type { InfiniteTableState } from '../types/InfiniteTableState';

/**
 * The filter value item of a column in the DataSource's `filterValue`: the
 * lookup of the computed columns (`computedFilterValue`) - by column id,
 * then by field (or group field); the last matching item wins.
 */
export function getColumnFilterValueItem<T>(
  filterValue: DataSourceFilterValueItem<T>[] | undefined,
  column:
    | Pick<InfiniteTableComputedColumn<T>, 'id' | 'field' | 'groupByForColumn'>
    | undefined,
): DataSourceFilterValueItem<T> | null {
  if (!filterValue || !column) {
    return null;
  }
  const fieldKey = (column.field || column.groupByForColumn) as
    | string
    | undefined;
  let byId: DataSourceFilterValueItem<T> | null = null;
  let byField: DataSourceFilterValueItem<T> | null = null;
  for (const item of filterValue) {
    if (item.id === column.id || item.field === column.id) {
      byId = item;
    }
    if (fieldKey && (item.id === fieldKey || item.field === fieldKey)) {
      byField = item;
    }
  }
  return byId || byField;
}

function sameFilter<T>(
  a: DataSourceFilterValueItem<T> | null,
  b: DataSourceFilterValueItem<T> | null,
) {
  if (!a || !b) {
    return a === b;
  }
  return (
    a.filter.type === b.filter.type &&
    a.filter.operator === b.filter.operator &&
    a.filter.value === b.filter.value &&
    !!a.disabled === !!b.disabled
  );
}

type PendingFilter = {
  timeout: ReturnType<typeof setTimeout>;
  /** the column's filter when the value was typed */
  typedOver: DataSourceFilterValueItem<any> | null;
};

/**
 * The filter values typed in the header that wait `filterDelay` before they
 * are applied, one per column (the last one typed).
 *
 * A pending value is dropped when the column's filter is written by
 * something else in the meantime, so it doesn't overwrite that write when
 * it fires:
 * - the table API writes it (setColumnFilter, clearColumnFilter, ...): the
 *   API calls `cancel`;
 * - the DataSource's filterValue changes in another way (a controlled
 *   `filterValue`, a restored state): when it fires, the pending value
 *   checks that the column's filter is the one it was typed over (by
 *   value - a filterValue built again with the same filters doesn't drop
 *   it), or the one this column applied last (a controlled filterValue
 *   gets it back after the apply).
 *
 * The filter editors of a column listen with `onCancel`, to show the
 * column's filter again instead of the dropped value.
 */
export class PendingColumnFilters {
  private pending = new Map<string, PendingFilter>();
  /** the value applied last, until the DataSource has it */
  private applied = new Map<string, unknown>();
  private cancelListeners = new Map<string, Set<() => void>>();

  schedule(
    columnId: string,
    value: unknown,
    options: {
      delay: number;
      /** the column's filter value item in the DataSource, now */
      getFilterValueItem: () => DataSourceFilterValueItem<any> | null;
      apply: (value: unknown) => void;
    },
  ) {
    const typedOver = options.getFilterValueItem();
    if (this.isLastApplied(columnId, typedOver)) {
      // the DataSource has it now
      this.applied.delete(columnId);
    }

    const previous = this.pending.get(columnId);
    if (previous) {
      clearTimeout(previous.timeout);
    }

    const timeout = setTimeout(() => {
      this.pending.delete(columnId);

      const current = options.getFilterValueItem();
      if (
        !sameFilter(current, typedOver) &&
        !this.isLastApplied(columnId, current)
      ) {
        this.applied.delete(columnId);
        this.notifyCancel(columnId);
        return;
      }

      options.apply(value);

      const applied = options.getFilterValueItem();
      if (applied && applied.filter.value === value) {
        this.applied.delete(columnId);
      } else {
        // not in the DataSource state yet: a controlled filterValue (or a
        // state that is updated on the next render)
        this.applied.set(columnId, value);
      }
    }, options.delay);

    this.pending.set(columnId, { timeout, typedOver });
  }

  /** drops the value waiting for the column, if any */
  cancel(columnId: string) {
    const pending = this.pending.get(columnId);
    if (!pending) {
      return;
    }
    clearTimeout(pending.timeout);
    this.pending.delete(columnId);
    this.notifyCancel(columnId);
  }

  onCancel(columnId: string, fn: () => void) {
    let listeners = this.cancelListeners.get(columnId);
    if (!listeners) {
      listeners = new Set();
      this.cancelListeners.set(columnId, listeners);
    }
    listeners.add(fn);
    return () => {
      listeners!.delete(fn);
      if (
        !listeners!.size &&
        this.cancelListeners.get(columnId) === listeners
      ) {
        this.cancelListeners.delete(columnId);
      }
    };
  }

  private isLastApplied(
    columnId: string,
    item: DataSourceFilterValueItem<any> | null,
  ) {
    return (
      !!item &&
      this.applied.has(columnId) &&
      item.filter.value === this.applied.get(columnId)
    );
  }

  private notifyCancel(columnId: string) {
    this.cancelListeners.get(columnId)?.forEach((fn) => fn());
  }
}

/**
 * What a header cell gives its filter editor to call on every change (the
 * value typed): `api.setColumnFilter`, `filterDelay` ms after the last
 * change - see PendingColumnFilters.
 */
export function createColumnFilterChangeHandler<T>(params: {
  columnId: string;
  filterDelay: number;
  api: Pick<InfiniteTableApi<T>, 'setColumnFilter'>;
  getState: () => Pick<InfiniteTableState<T>, 'pendingColumnFilters'>;
  getComputed: () => Pick<InfiniteTableComputedValues<T>, 'computedColumnsMap'>;
  getDataSourceState: () => Pick<DataSourceState<T>, 'filterValue'>;
}): (filterValue: any) => void {
  const { columnId, filterDelay, api } = params;

  const apply = (filterValue: any) => {
    api.setColumnFilter(columnId, filterValue);
  };

  if (!(filterDelay > 0)) {
    return apply;
  }

  const getFilterValueItem = () =>
    getColumnFilterValueItem(
      params.getDataSourceState().filterValue,
      params.getComputed().computedColumnsMap.get(columnId),
    );

  return (filterValue: any) => {
    params.getState().pendingColumnFilters.schedule(columnId, filterValue, {
      delay: filterDelay,
      getFilterValueItem,
      apply,
    });
  };
}
