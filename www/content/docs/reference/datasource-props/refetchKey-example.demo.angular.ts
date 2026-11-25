import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data) => {
      return new Promise<Developer[]>((resolve) => {
        // add a delay to make "reloading" more visible
        setTimeout(() => {
          resolve(data);
        }, 1000);
      });
    });
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },
  salary: { field: 'salary', type: 'number' },
  currency: { field: 'currency', type: 'number' },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <button
      style="color: var(--infinite-cell-color); margin: 10px; padding: 20px; background: var(--infinite-background)"
      (click)="refetchKey.set(refetchKey() + 1)"
    >
      Refetch data
    </button>
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      [refetchKey]="refetchKey()"
    >
      <infinite-table
        debugId="refetchKey-example"
        [columns]="columns"
        [columnDefaultWidth]="150"
        [loadingText]="'Refetching with key ' + refetchKey()"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;

  protected readonly refetchKey = signal(0);
}
