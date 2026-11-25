import { Component, computed, signal } from '@angular/core';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';


import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

import sinon from 'sinon';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  lastName: { field: 'lastName' },
  country: { field: 'country' },
};

const renderCount = signal(0);

// called from the template, so every render of the page passes
// a new object, with the same content
const getFilterTypes = (): any => ({
  custom: {
    label: 'Custom',
    emptyValues: [''],
    defaultOperator: 'eq',
    operators: [{ name: 'eq', fn: () => true }],
  },
});

const dataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql`).then(
    (r) => r.json(),
  );
};

const spiedDataSource = sinon.spy(dataSource);

(globalThis as any).dataSource = spiedDataSource;

const domProps = {
  style: {
    height: '80vh',
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
  <button (click)="renderCount.set(renderCount() + 1)">
    Rerender ({{ renderCount() }})
  </button>
  <infinite-data-source
    [data]="spiedDataSource"
    primaryKey="id"
    [filterTypes]="filterTypes()"
  >
    <infinite-table [columns]="columns" [domProps]="domProps" />
  </infinite-data-source>
  `,
})
export default class InlineFilterTypesShouldNotRefetchPage {
  protected readonly renderCount = renderCount;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  // every rerender passes a new object, with the same content (Vue: a
  // call in the template)
  protected readonly filterTypes = computed(() => {
    renderCount();
    return getFilterTypes();
  });
  protected readonly spiedDataSource = spiedDataSource;
}
