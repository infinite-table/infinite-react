import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { data } from './pivotData';
import type { Person } from './pivotData';

const domProps = {
  style: {
    height: '60vh',
    border: '1px solid gray',
    width: 'calc(100% - 20px)',
    marginLeft: '10px',
  },
};

const groupBy = [
  {
    field: 'department' as const,
    column: {
      id: 'dep-group',
      header: 'Department grouping',
      headerStyle: {
        color: 'red',
      },
      style: {
        color: 'rgb(0, 255, 0)',
      },
    },
  },
  {
    field: 'team' as const,
  },
];

const columns: Record<string, any> = {
  department: {
    field: 'department' as keyof Person,
  },
  team: {
    field: 'team' as keyof Person,
  },
  id: { field: 'id' as keyof Person },
  name: { field: 'name' as keyof Person },
  country: { field: 'country' as keyof Person },

  salary: {
    field: 'salary' as keyof Person,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="data" [groupBy]="groupBy">
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        [columnDefaultWidth]="150"
        groupRenderStrategy="multi-column"
      />
    </infinite-data-source>
  `,
})
export default class MultiColumnWithColGroupByPage {
  protected readonly domProps = domProps;
  protected readonly groupBy = groupBy;
  protected readonly columns = columns;
  protected readonly data = data;
}
