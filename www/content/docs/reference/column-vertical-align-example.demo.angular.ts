import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

type Align = 'start' | 'center' | 'end';

const headerOptions = {
  alwaysReserveSpaceForSortIcon: false,
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div style="color: var(--infinite-cell-color); padding: 10px">
      <p>Select the vertical align</p>
      <select [value]="verticalAlign()" (change)="onVerticalAlignChange($event)">
        <option value="start">Start</option>
        <option value="center">Center</option>
        <option value="end">End</option>
      </select>
    </div>
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        debugId="column-vertical-align-example"
        [columns]="columns()"
        [columnDefaultWidth]="250"
        [rowHeight]="80"
        [headerOptions]="headerOptions"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly headerOptions = headerOptions;

  protected readonly verticalAlign = signal<Align>('center');

  // new columns when the vertical align changes
  protected readonly columns = computed<InfiniteTablePropColumns<Developer>>(
    () => ({
      firstName: {
        field: 'firstName',

        verticalAlign: this.verticalAlign(),
      },
    }),
  );

  protected onVerticalAlignChange(event: Event) {
    this.verticalAlign.set((event.target as HTMLSelectElement).value as Align);
  }
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};
