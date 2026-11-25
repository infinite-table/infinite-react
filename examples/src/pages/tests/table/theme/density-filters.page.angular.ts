import { Component, signal } from '@angular/core';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';


import { employees } from '../props/group-by/employees10';

const columns: Record<string, any> = {
  firstName: { field: 'firstName', header: 'First Name' },
  department: { field: 'department', header: 'Department' },
  age: { field: 'age', type: 'number', header: 'Age' },
};

const defaultGroupBy: any[] = [{ field: 'country' }];
const defaultFilterValue: any[] = [
  {
    field: 'department',
    filter: { type: 'string', operator: 'includes', value: 'e' },
  },
];
const domProps = { style: { height: '500px' } };

const density = signal('');

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
  <div>
    <button data-name="compact" (click)="density.set('compact')">compact</button>
    <button data-name="spacious" (click)="density.set('spacious')">spacious</button>
    <div id="wrapper" [class]="density() ? 'infinite-density--' + density() : ''">
      <infinite-data-source
        [data]="employees"
        primaryKey="id"
        [defaultGroupBy]="defaultGroupBy"
        [defaultFilterValue]="defaultFilterValue"
      >
        <infinite-table [domProps]="domProps" [columns]="columns" />
      </infinite-data-source>
    </div>
  </div>
  `,
})
export default class DensityFiltersPage {
  protected readonly employees = employees;
  protected readonly density = density;
  protected readonly columns = columns;
  protected readonly defaultFilterValue = defaultFilterValue;
  protected readonly defaultGroupBy = defaultGroupBy;
  protected readonly domProps = domProps;
}
