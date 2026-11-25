import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

type Person = {
  id: number;
  country: string;
  city: string;
  firstName: string;
};

const dataSource = () => {
  return Promise.resolve([
    {
      id: 1,
      country: 'Italy',
      city: 'Rome',
      firstName: 'Giuseppe',
    },
    {
      id: 2,
      country: 'Italy',
      city: 'Rome',
      firstName: 'Marco',
    },
    {
      id: 3,
      country: 'Italy',
      city: 'Napoli',
      firstName: 'Luca',
    },
    {
      id: 4,
      country: 'USA',
      city: 'LA',
      firstName: 'Bob',
    },
  ] as Person[]);
};

const columns: Record<string, any> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const setDataArray = (dataArray: any) => {
  (globalThis as any).dataArray = dataArray;
  return '';
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      #ds="infiniteDataSource"
      [data]="dataSource"
      primaryKey="id"
    >
      {{ setDataArray(ds.dataArray()) }}
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="300"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class RowInfoNoGroupingPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly setDataArray = setDataArray;
}
