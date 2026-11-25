import { Component } from '@angular/core';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import { employees } from '../props/group-by/employees10';

const columns: Record<string, any> = {
  firstName: { field: 'firstName', header: 'First Name' },
  department: { field: 'department', header: 'Department' },
  age: { field: 'age', type: 'number', header: 'Age' },
  salary: { field: 'salary', type: 'number', header: 'Salary' },
};

const groupBy: any[] = [{ field: 'country' }];

const defaultSortInfo: any[] = [
  { field: 'firstName', dir: 1 as const },
  { field: 'age', dir: -1 as const },
];

const defaultFilterValue: any[] = [
  {
    field: 'department',
    filter: { type: 'string', operator: 'includes', value: 'e' },
  },
];

const domProps = {
  style: { height: '600px', margin: '10px' },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
  <infinite-data-source
    [data]="employees"
    primaryKey="id"
    [groupBy]="groupBy"
    [defaultSortInfo]="defaultSortInfo"
    [defaultFilterValue]="defaultFilterValue"
  >
    <infinite-table
      [domProps]="domProps"
      [columns]="columns"
      [columnDefaultWidth]="220"
    />
  </infinite-data-source>
  `,
})
export default class IconsPage {
  protected readonly employees = employees;
  protected readonly columns = columns;
  protected readonly defaultFilterValue = defaultFilterValue;
  protected readonly defaultSortInfo = defaultSortInfo;
  protected readonly domProps = domProps;
  protected readonly groupBy = groupBy;
}
