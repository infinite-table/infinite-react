import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

type Person = {
  id: number;
  country: string;
  city: string;
  firstName: string;
  age: number;
};

const dataSource = () => {
  return Promise.resolve([
    {
      id: 1,
      country: 'Italy',
      city: 'Rome',
      firstName: 'Giuseppe',
      age: 20,
    },
    {
      id: 2,
      country: 'Italy',
      city: 'Rome',
      firstName: 'Marco',
      age: 30,
    },
    {
      id: 3,
      country: 'Italy',
      city: 'Napoli',
      age: 40,
      firstName: 'Luca',
    },
    {
      id: 4,
      country: 'USA',
      city: 'LA',
      age: 50,
      firstName: 'Bob',
    },
  ] as Person[]);
};

const columns: Record<string, any> = {
  firstName: {
    field: 'firstName',
  },
};

const groupBy = [
  {
    field: 'country' as const,
  },
  { field: 'city' as const },
  { field: 'age' as const },
];

const groupRowsState = {
  collapsedRows: [
    ['Italy', 'Rome'],
    ['Italy', 'Napoli'],
  ],
  expandedRows: true as const,
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
      [groupBy]="groupBy"
      [groupRowsState]="groupRowsState"
    >
      {{ setDataArray(ds.dataArray()) }}
      <infinite-table
        [domProps]="domProps"
        groupRenderStrategy="single-column"
        [columnDefaultWidth]="300"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class RowInfoWithGroupingCollapsedPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly groupRowsState = groupRowsState;
  protected readonly domProps = domProps;
  protected readonly setDataArray = setDataArray;
}
