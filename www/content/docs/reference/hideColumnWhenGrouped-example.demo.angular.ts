import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropGroupBy,
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

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: {
    field: 'firstName',
  },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
  stack: {
    field: 'stack',
    style: {
      color: 'tomato',
    },
  },
  age: { field: 'age' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
};

const groupColumn = {
  field: 'firstName' as keyof Developer,
};

const domProps = {
  style: { flex: 1 },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
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
            [checked]="hideColumnWhenGrouped()"
            (change)="hideColumnWhenGrouped.set(!hideColumnWhenGrouped())"
          />Hide Column When Grouped
        </label>
      </div>
      <infinite-data-source
        [data]="dataSource"
        primaryKey="id"
        [groupBy]="groupBy"
      >
        <infinite-table
          debugId="hideColumnWhenGrouped-example"
          [groupColumn]="groupColumn"
          [columns]="columns"
          [hideColumnWhenGrouped]="hideColumnWhenGrouped()"
          [columnDefaultWidth]="250"
          [domProps]="domProps"
        />
      </infinite-data-source>
    </div>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly groupColumn = groupColumn;
  protected readonly domProps = domProps;

  protected readonly hideColumnWhenGrouped = signal(true);
}
