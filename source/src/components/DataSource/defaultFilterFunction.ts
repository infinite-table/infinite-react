import type {
  DataSourceFilterFunctionParam,
  DataSourceFilterOperatorFunction,
  DataSourceFilterOperatorFunctionParam,
  DataSourceFilterValueItemValueGetter,
  DataSourcePropFilterTypes,
  DataSourcePropFilterValue,
  DataSourceState,
  DataSourceTreeFilterFunctionParam,
} from './types';

export function cleanupEmptyFilterValues<T>(
  filterValue: DataSourceState<T>['filterValue'],

  filterTypes: DataSourceState<T>['filterTypes'],
) {
  if (!filterValue) {
    return filterValue;
  }
  // for remote filters, we don't want to include the values that are empty
  return filterValue.filter((filterValue) => {
    const filterType = filterTypes[filterValue.filter.type];
    if (!filterType) {
      return false;
    }

    if (
      filterType.emptyValues &&
      filterType.emptyValues.includes(filterValue.filter.value)
    ) {
      return false;
    }
    return true;
  });
}

type ActiveFilter<T> = {
  field: keyof T | undefined;
  valueGetter: DataSourceFilterValueItemValueGetter<T> | undefined;
  fn: DataSourceFilterOperatorFunction<T>;
  value: any;
  emptyValues: any[];
};

const activeFiltersCache = new WeakMap<
  DataSourcePropFilterValue<any>,
  WeakMap<DataSourcePropFilterTypes<any>, ActiveFilter<any>[]>
>();

/**
 * The filter items that can actually run: not empty, not disabled, with a
 * known filter type and operator. Computed once per (filterValue, filterTypes) pair.
 */
export function getActiveFilters<T>(
  filterValue: DataSourcePropFilterValue<T> | undefined,
  filterTypes: DataSourcePropFilterTypes<T>,
): ActiveFilter<T>[] {
  if (!filterValue || !filterValue.length) {
    return [];
  }

  let byFilterTypes = activeFiltersCache.get(filterValue);
  if (!byFilterTypes) {
    byFilterTypes = new WeakMap();
    activeFiltersCache.set(filterValue, byFilterTypes);
  }

  const cached = byFilterTypes.get(filterTypes);
  if (cached) {
    return cached;
  }

  const activeFilters: ActiveFilter<T>[] = [];
  const items = cleanupEmptyFilterValues(filterValue, filterTypes) || [];

  for (let i = 0, len = items.length; i < len; i++) {
    const item = items[i];
    const filterType = filterTypes[item.filter.type];
    if (item.disabled || !filterType) {
      continue;
    }

    let operatorFn: DataSourceFilterOperatorFunction<T> | undefined;
    // the last operator with a given name wins
    for (let j = 0; j < filterType.operators.length; j++) {
      const operator = filterType.operators[j];
      if (operator.name === item.filter.operator) {
        operatorFn = operator.fn;
      }
    }
    if (!operatorFn) {
      continue;
    }

    activeFilters.push({
      field: item.field,
      valueGetter: item.valueGetter || filterType.valueGetter,
      fn: operatorFn,
      value: item.filter.value,
      emptyValues: filterType.emptyValues,
    });
  }

  byFilterTypes.set(filterTypes, activeFilters);

  return activeFilters;
}

export function matchesActiveFilters<T>(
  activeFilters: ActiveFilter<T>[],
  param: Pick<
    DataSourceFilterFunctionParam<T>,
    'data' | 'index' | 'dataArray' | 'primaryKey'
  >,
): boolean {
  if (!activeFilters.length) {
    return true;
  }
  const { data } = param;

  const operatorParam: DataSourceFilterOperatorFunctionParam<T> = {
    data,
    index: param.index,
    dataArray: param.dataArray,
    primaryKey: param.primaryKey,
    field: undefined,
    filterValue: undefined,
    currentValue: undefined,
    emptyValues: [],
  };

  for (let i = 0, len = activeFilters.length; i < len; i++) {
    const activeFilter = activeFilters[i];

    operatorParam.field = activeFilter.field;
    operatorParam.filterValue = activeFilter.value;
    operatorParam.currentValue = activeFilter.valueGetter
      ? activeFilter.valueGetter(operatorParam)
      : activeFilter.field
      ? data[activeFilter.field]
      : data;
    operatorParam.emptyValues = activeFilter.emptyValues;

    if (!activeFilter.fn(operatorParam)) {
      return false;
    }
  }
  return true;
}

let defaultFilterFunctionCalls = 0;

export function getDefaultFilterFunctionCalls() {
  return defaultFilterFunctionCalls;
}

/**
 * The built-in column filtering, for one row: whether the row matches every
 * active item of `filterValue`.
 *
 * Passing it as `filterFunction` is exactly the built-in local filtering.
 * Compose it to combine your own filtering with the column filters:
 *
 * ```ts
 * filterFunction={(param) => defaultFilterFunction(param) && param.data.age > 30}
 * ```
 */
export function defaultFilterFunction<T>(
  param: DataSourceFilterFunctionParam<T>,
): boolean {
  defaultFilterFunctionCalls++;
  return matchesActiveFilters(
    getActiveFilters(param.filterValue, param.filterTypes),
    param,
  );
}

/**
 * The built-in column filtering for tree data: leaf nodes are matched with
 * `defaultFilterFunction`; a parent node is kept (with only its kept children)
 * when at least one of its descendants is kept. The fields of parent nodes are
 * not matched against the filters.
 */
export function defaultTreeFilterFunction<T>(
  param: DataSourceTreeFilterFunctionParam<T>,
): T | boolean {
  if (!getActiveFilters(param.filterValue, param.filterTypes).length) {
    return true;
  }
  return param.isLeafNode
    ? defaultFilterFunction(param)
    : param.filterTreeNode(param.data);
}
