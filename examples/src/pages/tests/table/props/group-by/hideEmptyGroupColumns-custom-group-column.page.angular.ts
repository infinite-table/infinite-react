import { Component, signal, computed } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  GroupRowsState,
} from '@infinite-table/infinite-angular';

import { employees } from './employees10';

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
  department: {
    field: 'department',
    header: 'Department',
  },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const groupColumnFn = (options: any) => {
  const { groupByForColumn } = options;

  return {
    id: 'g-for-' + groupByForColumn?.field,
    header: `G for ${groupByForColumn?.field}`,
  };
};

const customGroupColumnId = signal(false);

const groupBy = computed<any[]>(() => [
  {
    field: 'department',
  },
  {
    field: 'country',
    column: customGroupColumnId()
      ? { id: 'custom-country', header: 'custom-country' }
      : undefined,
  },
]);

const hideEmptyGroupColumns = signal(true);

const toggleCustomGroupColumnId = () => {
  customGroupColumnId.set(!customGroupColumnId());
};

const toggleHideEmptyGroupColumns = () => {
  hideEmptyGroupColumns.set(!hideEmptyGroupColumns());
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="toggleCustomGroupColumnId()">
      use custom group column id
    </button>
    <label (change)="toggleHideEmptyGroupColumns()">
      Hide empty group columns
      <input type="checkbox" [checked]="hideEmptyGroupColumns()" />
    </label>
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      [groupBy]="groupBy()"
      [defaultGroupRowsState]="groupRowsState"
    >
      <infinite-table
        [domProps]="domProps"
        [groupColumn]="groupColumnFn"
        [hideEmptyGroupColumns]="hideEmptyGroupColumns()"
        [columnDefaultWidth]="200"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class HideEmptyGroupColumnsCustomGroupColumnPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupRowsState = groupRowsState;
  protected readonly domProps = domProps;
  protected readonly groupColumnFn = groupColumnFn;
  protected readonly groupBy = groupBy;
  protected readonly hideEmptyGroupColumns = hideEmptyGroupColumns;
  protected readonly toggleCustomGroupColumnId = toggleCustomGroupColumnId;
  protected readonly toggleHideEmptyGroupColumns = toggleHideEmptyGroupColumns;
}
