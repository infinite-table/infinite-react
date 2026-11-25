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
    },
  },
  {
    field: 'team' as const,
    column: {
      id: 'my-custom-team-group',
      style: {
        color: 'rgb(255, 0, 0)',
      },
      headerStyle: {
        color: 'red',
      },
    },
  },
  {
    field: 'country' as const,
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
};

const groupColumn = ({ groupByForColumn }: { groupByForColumn?: any }) => {
  const col: Record<string, any> = {
    style: {
      color: 'rgb(0, 100, 0)',
    },
  };
  if (groupByForColumn?.field === 'department') {
    col.id = 'xx-dep-xx';
  }

  return col;
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="data" [groupBy]="groupBy">
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        [groupColumn]="groupColumn"
        [columnDefaultWidth]="140"
        groupRenderStrategy="multi-column"
      />
    </infinite-data-source>
  `,
})
export default class MultiColumnWithGroupColumnPropPage {
  protected readonly domProps = domProps;
  protected readonly groupBy = groupBy;
  protected readonly columns = columns;
  protected readonly groupColumn = groupColumn;
  protected readonly data = data;
}
