import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropGroupBy,
  DataSourcePropGroupRowsState,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const groupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'stack',
  },
  {
    field: 'preferredLanguage',
  },
];

const domProps = {
  style: { flex: 1 },
};

const groupRowsState: DataSourcePropGroupRowsState = {
  expandedRows: [],
  collapsedRows: true,
};

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: { field: 'firstName' },
  age: { field: 'age' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
  stack: { field: 'stack' },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div
      style="
        display: flex;
        flex: 1;
        color: var(--infinite-cell-color);
        flex-flow: column;
        background: var(--infinite-background);
      "
    >
      <div style="padding: 10px">
        <label>
          <input
            type="checkbox"
            [checked]="hideEmptyGroupColumns()"
            (change)="hideEmptyGroupColumns.set(!hideEmptyGroupColumns())"
          />
          Hide Empty Group Columns (make sure all \`Stack\` groups are
          collapsed to see it in action). Try to expand the group column to see
          the new group column being added on-the-fly.
        </label>
      </div>
      <infinite-data-source
        [data]="dataSource"
        primaryKey="id"
        [defaultGroupRowsState]="groupRowsState"
        [groupBy]="groupBy"
      >
        <infinite-table
          debugId="hideEmptyGroupColumns-example"
          [domProps]="domProps"
          [hideEmptyGroupColumns]="hideEmptyGroupColumns()"
          groupRenderStrategy="multi-column"
          [columns]="columns"
          [columnDefaultWidth]="250"
        />
      </infinite-data-source>
    </div>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly groupRowsState = groupRowsState;
  protected readonly domProps = domProps;

  protected readonly hideEmptyGroupColumns = signal(true);
}
