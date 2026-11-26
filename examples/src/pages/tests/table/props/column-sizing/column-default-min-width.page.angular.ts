import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import type {
  DataSourceData,
  DataSourceDataParams,
  InfiniteTableColumn,
  InfiniteTablePropColumnSizing,
  InfiniteTablePropColumnTypes,
} from '@infinite-table/infinite-angular';

import { employees } from '../group-by/employees10';

type Employee = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
  streetName: string;
  streetNo: number;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};

const dataSource = () => {
  return Promise.resolve(employees as Employee[]);
};
const columns: Record<string, InfiniteTableColumn<Employee>> = {
  id: { field: 'id', defaultWidth: 500 },
  country: {
    field: 'country',
    type: 'country',
    defaultWidth: 300,
  },
  city: { field: 'city' },
  team: { field: 'team' },
  department: { field: 'department' },
  firstName: { field: 'firstName', defaultWidth: 777, type: 'empty' },
  lastName: { field: 'lastName' },
  salary: { field: 'salary', type: 'empty', defaultWidth: 555 },
  age: { field: 'age', type: 'custom-number', defaultWidth: 110 },
};

const defaultColumnSizing: InfiniteTablePropColumnSizing = {
  age: {
    width: 1000,
  },
  salary: {
    width: 145,
  },
};

const columnTypes: InfiniteTablePropColumnTypes<Employee> = {
  'custom-number': {
    align: 'end',
    defaultWidth: 100,
  },
  country: {
    minWidth: 450,
  },
  empty: {},
  default: {
    defaultWidth: 234,
    align: 'center',
    renderValue: ({ value }) => `${value}!!!`,
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '90vh',
    width: '5000px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const onDataChange = (dataInfo: DataSourceDataParams<Employee>) => {
  console.log(dataInfo);
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="update()">UPDATE</button>
    <infinite-data-source
      primaryKey="id"
      [data]="currentData()"
      (dataParamsChange)="onDataChange($event)"
    >
      <infinite-table
        [domProps]="domProps"
        [columnTypes]="columnTypes"
        [defaultColumnSizing]="defaultColumnSizing"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ColumnDefaultMinWidthPage {
  protected readonly columns = columns;
  protected readonly columnTypes = columnTypes;
  protected readonly defaultColumnSizing = defaultColumnSizing;
  protected readonly domProps = domProps;
  protected readonly onDataChange = onDataChange;

  protected readonly currentData = signal<DataSourceData<Employee>>(dataSource);

  protected update() {
    this.currentData.set([] as Employee[]);

    setTimeout(() => {
      this.currentData.set(dataSource.bind({}));
    }, 1000);
  }
}
