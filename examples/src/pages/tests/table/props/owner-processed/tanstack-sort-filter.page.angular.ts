import {
  Component,
  computed,
  linkedSignal,
  resource,
  signal,
} from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  defaultFilterFunction,
  defaultFilterTypes,
  multisort,
} from '@infinite-table/infinite-angular';
import type {
  DataSourcePropFilterValue,
  DataSourceSingleSortInfo,
  InfiniteTableColumn,
} from '@infinite-table/infinite-angular';

import { developers } from './developers';
import type { Developer } from './developers';

// The React page loads the rows with TanStack Query; the Angular-native way
// is `resource()`, with the sort and filter values as its params.

// every query stays pending until the test calls `releaseQuery()`
const pendingQueries: (() => void)[] = [];
(globalThis as any).queryCalls = 0;
(globalThis as any).releaseQuery = () => {
  pendingQueries.splice(0).forEach((resolve) => resolve());
};

function queryDevelopers(
  sortInfo: DataSourceSingleSortInfo<Developer>[],
  filterValue: DataSourcePropFilterValue<Developer>,
) {
  (globalThis as any).queryCalls++;

  return new Promise<Developer[]>((resolve) => {
    pendingQueries.push(() => {
      const filtered = developers.filter((data, index, dataArray) =>
        defaultFilterFunction({
          data,
          index,
          dataArray,
          primaryKey: data.id,
          filterValue,
          filterTypes: defaultFilterTypes,
        }),
      );
      resolve(multisort(sortInfo, filtered));
    });
  });
}

// TanStack Query compares query keys by value: a new array with the same
// sort/filter value does not start a new query
const sameQueryKey = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

const columns: Record<string, InfiniteTableColumn<Developer>> = {
  name: { field: 'name' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },
};

const domProps = { style: { height: '80vh' } };
const noRows: Developer[] = [];
const shouldReloadData = { sortInfo: true, filterValue: true };

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="rows()"
      [sortInfo]="sortInfo()"
      (sortInfoChange)="sortInfo.set($any($event))"
      [filterValue]="filterValue()"
      (filterValueChange)="filterValue.set($event ?? [])"
      [filterDelay]="0"
      [shouldReloadData]="shouldReloadData"
    >
      <infinite-table
        [columns]="columns"
        [showColumnFilters]="true"
        [domProps]="domProps"
      />
    </infinite-data-source>
  `,
})
export default class TanstackSortFilterPage {
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly shouldReloadData = shouldReloadData;

  protected readonly sortInfo = signal<DataSourceSingleSortInfo<Developer>[]>(
    [],
  );
  protected readonly filterValue = signal<DataSourcePropFilterValue<Developer>>(
    [],
  );

  private readonly queryKey = computed(
    () => ({ sortInfo: this.sortInfo(), filterValue: this.filterValue() }),
    { equal: sameQueryKey },
  );

  private readonly developers = resource({
    params: () => this.queryKey(),
    loader: ({ params }) =>
      queryDevelopers(params.sortInfo, params.filterValue),
  });

  // like TanStack's `placeholderData: keepPreviousData`: while a new query
  // loads, the resource has no value - keep showing the previous rows
  protected readonly rows = linkedSignal<Developer[] | undefined, Developer[]>({
    source: () => this.developers.value(),
    computation: (value, previous) => value ?? previous?.value ?? noRows,
  });
}
