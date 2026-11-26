import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { employees } from './employees10';

const dataSource = () => {
  return Promise.resolve(employees);
};

const columns: Record<string, any> = {
  firstNameID: {
    field: 'firstName',
    header: 'First Name',
  },

  countryID: {
    field: 'country',
  },

  cityID: {
    field: 'city',
  },

  streetNameID: {
    field: 'streetName',
  },
  streetNoID: {
    field: 'streetNo',
  },
  ageID: {
    field: 'age',
    type: 'number',
  },
  departmentID: {
    field: 'department',
    defaultHiddenWhenGroupedBy: 'department',
  },
  salaryID: {
    field: 'salary',
    type: 'number',
    defaultHiddenWhenGroupedBy: { salary: true, team: true },
  },
  teamID: {
    field: 'team',
    defaultHiddenWhenGroupedBy: '*',
  },

  companyID: { field: 'companyName' },
  companySizeID: { field: 'companySize' },
};

const groupBy = signal<any[]>([
  {
    field: 'country',
  },
  { field: 'city' },
  { field: 'department' },
  { field: 'team' },
  { field: 'companySize' },
]);

(globalThis as any).setGroupBy = (newGroupBy: any[]) => {
  groupBy.set(newGroupBy);
};

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    minWidth: '10000px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const groupColumn = ({ groupByForColumn }: { groupByForColumn?: any }) => {
  return {
    defaultWidth: 200,
    header: `Group by ${groupByForColumn?.field}`,
  };
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      [groupBy]="groupBy()"
    >
      <infinite-table
        [domProps]="domProps"
        [groupColumn]="groupColumn"
        [columnDefaultWidth]="100"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ColumnDefaultHiddenWhenGroupedByPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly domProps = domProps;
  protected readonly groupColumn = groupColumn;
}
