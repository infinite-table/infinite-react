import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import type { InfiniteTableColumn } from '@infinite-table/infinite-angular';

import { Employee, employees } from './employees10';

const dataSource = () => {
  return Promise.resolve(employees);
};

const columns: Record<string, InfiniteTableColumn<Employee>> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  country: {
    field: 'country',
    header: 'Country',
  },
  city: {
    field: 'city',
    header: 'City',
  },

  age: {
    field: 'age',
    type: 'number',
    header: 'Age',
    valueGetter: ({ data }: any) => data.age * 2,
    valueFormatter: ({ value, rowInfo }: any) =>
      `index: ${1000 - rowInfo.indexInAll} - ${value}!`,
  },
  department: {
    field: 'department',
    header: 'Department',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  team: {
    field: 'team',
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ValueFormatterPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
}
