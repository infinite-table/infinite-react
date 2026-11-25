import { Component } from '@angular/core';

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
    field: 'age',
    column: {
      renderGroupValue: ({ value }: { value: any }) => `Age: ${value}`,
    },
  },
  {
    field: 'stack',
  },
];

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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      [groupBy]="groupBy"
    >
      <infinite-table
        debugId="row-grouping-multi-column-example"
        [columns]="columns"
        [columnDefaultWidth]="150"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
}
