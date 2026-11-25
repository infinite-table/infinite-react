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
      <p>Select the header align</p>
      <select [value]="headerAlign()" (change)="onHeaderAlignChange($event)">
        <option value="start">Start</option>
        <option value="center">Center</option>
        <option value="end">End</option>
      </select>
    </div>
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        debugId="column-header-align-example"
        [columns]="columns()"
        [columnDefaultWidth]="250"
        [headerOptions]="headerOptions"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly headerOptions = headerOptions;

  protected readonly headerAlign = signal<Align>('start');

  // new columns when the header align changes
  protected readonly columns = computed<InfiniteTablePropColumns<Developer>>(
    () => ({
      firstName: {
        field: 'firstName',

        headerAlign: this.headerAlign(),
      },
    }),
  );

  protected onHeaderAlignChange(event: Event) {
    this.headerAlign.set((event.target as HTMLSelectElement).value as Align);
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
