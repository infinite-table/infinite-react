import { Component, effect, signal } from '@angular/core';

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

type Developer = {
  id: number;
  firstName: string;
  country: string;
  stack: string;
  age: number;
};

const developers: Developer[] = [
  { id: 1, firstName: 'Bob', country: 'USA', stack: 'backend', age: 30 },
  { id: 2, firstName: 'Alice', country: 'France', stack: 'frontend', age: 25 },
  { id: 3, firstName: 'Carl', country: 'USA', stack: 'full-stack', age: 40 },
  { id: 4, firstName: 'Dana', country: 'France', stack: 'backend', age: 35 },
  { id: 5, firstName: 'Eve', country: 'Germany', stack: 'frontend', age: 28 },
  { id: 6, firstName: 'Frank', country: 'Germany', stack: 'backend', age: 45 },
];

// pretend this runs on a server: it filters and sorts the rows,
// with the same functions the DataSource uses
function fetchDevelopers(
  sortInfo: DataSourceSingleSortInfo<Developer>[],
  filterValue: DataSourcePropFilterValue<Developer>,
) {
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
  const rows = multisort(sortInfo, filtered);

  return new Promise<Developer[]>((resolve) => {
    setTimeout(() => resolve(rows), 600);
  });
}

const columns: Record<string, InfiniteTableColumn<Developer>> = {
  firstName: { field: 'firstName', header: 'First name' },
  country: { field: 'country' },
  stack: { field: 'stack' },
  age: { field: 'age', type: 'number' },
};

const noRows: Developer[] = [];

const shouldReloadData = { sortInfo: true, filterValue: true };

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <p style="color: var(--infinite-cell-color)">
      {{ isFetching() ? 'Loading...' : 'Sort or filter a column' }}
    </p>
    <infinite-data-source
      primaryKey="id"
      [data]="data()"
      [(sortInfo)]="sortInfo"
      [(filterValue)]="filterValue"
      [shouldReloadData]="shouldReloadData"
    >
      <infinite-table [columns]="columns" [showColumnFilters]="true" />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly columns = columns;
  protected readonly shouldReloadData = shouldReloadData;

  protected readonly sortInfo = signal<DataSourceSingleSortInfo<Developer>[]>(
    [],
  );
  protected readonly filterValue = signal<DataSourcePropFilterValue<Developer>>(
    [],
  );

  protected readonly data = signal<Developer[]>(noRows);
  protected readonly isFetching = signal(false);

  private lastRequestId = 0;

  constructor() {
    // every change of the sorting or of the filtering loads the rows again
    effect(() => {
      const sortInfo = this.sortInfo();
      const filterValue = this.filterValue();
      const requestId = ++this.lastRequestId;

      this.isFetching.set(true);

      fetchDevelopers(sortInfo, filterValue).then((rows) => {
        if (requestId !== this.lastRequestId) {
          // the sorting or the filtering has changed again in the meantime
          return;
        }
        // the previous rows stay on screen until the new ones arrive
        this.data.set(rows);
        this.isFetching.set(false);
      });
    });
  }
}
