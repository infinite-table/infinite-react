import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropGroupBy,
  InfiniteTableColumn,
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
    style: {
      color: 'orange',
    },
    renderValue: ({ value, rowInfo }) =>
      rowInfo.isGroupRow ? null : `${value}.`,
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

const groupColumn: InfiniteTableColumn<Developer> = {
  field: 'firstName',
  renderValue: ({ value }) => {
    return `First name: ${value}`;
  },
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
    <infinite-data-source [data]="dataSource" primaryKey="id" [groupBy]="groupBy">
      <infinite-table
        debugId="group-column-custom-renderers-example"
        [groupColumn]="groupColumn"
        [columns]="columns"
        [columnDefaultWidth]="250"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly groupColumn = groupColumn;
}
