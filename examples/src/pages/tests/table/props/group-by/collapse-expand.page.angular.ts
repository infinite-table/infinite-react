import { Component, TemplateRef, viewChild } from '@angular/core';

import {
  DataSource,
  GroupRowsState,
  InfiniteTable,
} from '@infinite-table/infinite-angular';

import { employees } from './employees10';

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

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      [groupBy]="groupBy"
      [aggregationReducers]="reducers"
      [defaultGroupRowsState]="groupRowsState"
      (groupRowsStateChange)="onGroupRowsStateChange($event)"
    >
      <infinite-table
        [domProps]="domProps"
        [groupColumn]="groupColumn"
        [columnDefaultWidth]="100"
        [columns]="columns"
        [columnGroups]="columnGroups"
      />
    </infinite-data-source>

    <ng-template #salaryGroup let-rowInfo="rowInfo">
      <span>Avg salary <b>{{ rowInfo.groupKeys?.join(', ') }}</b>: <b>{{ rowInfo.reducerResults?.salary }}</b></span>
    </ng-template>
  `,
})
export default class GroupByCollapseExpandPage {
  protected readonly dataSource = dataSource;

  private readonly salaryGroup =
    viewChild.required<TemplateRef<unknown>>('salaryGroup');

  protected readonly columns: Record<string, any> = {
    firstName: {
      field: 'firstName',
      header: 'First Name',
    },
    country: {
      field: 'country',
      header: 'Country',

      columnGroup: 'location',
      render: ({ value, rowInfo }: { value: any; rowInfo: any }) => {
        if (!rowInfo.isGroupRow) {
          return value;
        }
        return `Group for ${rowInfo.groupKeys?.join(',')}`;
      },
    },
    city: {
      field: 'city',
      header: 'City',
      columnGroup: 'address',
    },
    streetName: {
      field: 'streetName',
      header: 'Street Name',
      columnGroup: 'street',
    },
    streetNo: {
      columnGroup: 'street',
      field: 'streetNo',
      header: 'Street Number',
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
      header: 'Salary',

      render: ({ value, rowInfo }: { value: any; rowInfo: any }) => {
        if (rowInfo.isGroupRow) {
          // the template gets the render param (rowInfo, value, ...)
          return this.salaryGroup();
        }
        return `${value}`;
      },
    },
    team: {
      field: 'team',
      header: 'Team',
    },
    company: { field: 'companyName', header: 'Company' },
    companySize: { field: 'companySize', header: 'Company Size' },
  };

  protected readonly columnGroups = {
    address: { columnGroup: 'location', header: 'Address' },
    street: { columnGroup: 'address', header: 'Street' },
    location: { header: 'Location' },
  };

  protected readonly reducers = {
    salary: {
      initialValue: 0,
      field: 'salary' as const,

      reducer: (acc: number, sum: number) => acc + sum,
      done: (sum: number, arr: any[]) =>
        Math.floor(arr.length ? sum / arr.length : 0),
    },
  };

  protected readonly groupRowsState = new GroupRowsState({
    expandedRows: [['Cuba', 'Havana'], ['Cuba']],
    collapsedRows: true,
  });

  protected readonly groupBy = [
    {
      field: 'country' as const,
    },
    { field: 'city' as const, column: { header: 'hey' } },
  ];

  protected onGroupRowsStateChange(state: any) {
    console.log(state);
  }

  protected readonly groupColumn = ({
    groupByForColumn,
  }: {
    groupByForColumn?: any;
  }) => {
    return {
      header: `Group ${groupByForColumn?.field}`,
    };
  };

  protected readonly domProps = {
    style: {
      margin: '5px',
      height: '900px',
      border: '1px solid gray',
      position: 'relative' as const,
    },
  };
}
