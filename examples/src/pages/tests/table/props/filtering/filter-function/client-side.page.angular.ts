import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { employees } from '../employees10';
import type { Employee } from '../employees10';

import {
  departmentManagementFilterFunction,
  departmentMarketingFilterFunction,
} from './filterFn';

const dataSource = () => {
  return Promise.resolve(employees);
};

const columns: Record<string, any> = {
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
    <h2>Current filter function: {{ filterFn()?.name }}</h2>
    <button data-name="none" (click)="filterFn.set(undefined)">Clear filter</button>
    <button
      data-name="management"
      (click)="filterFn.set(departmentManagementFilterFunction)"
    >
      Filter by deparment=management
    </button>
    <button
      data-name="marketing"
      (click)="filterFn.set(departmentMarketingFilterFunction)"
    >
      Filter by deparment=marketing
    </button>

    <infinite-data-source [data]="dataSource" primaryKey="id" [filterFunction]="filterFn()">
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class FilterFunctionClientSidePage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly departmentManagementFilterFunction =
    departmentManagementFilterFunction;
  protected readonly departmentMarketingFilterFunction =
    departmentMarketingFilterFunction;

  protected readonly filterFn = signal<
    ((param: { data: Employee }) => boolean) | undefined
  >(undefined);
}
