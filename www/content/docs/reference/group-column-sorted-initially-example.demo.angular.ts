import { Component } from '@angular/core';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropSortInfo,
  DataSourcePropGroupBy,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

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
  theFirstName: {
    field: 'firstName',
    style: {
      color: 'orange',
    },
    // hide this column when grouping active
    // as the group column is anyways bound to this field
    defaultHiddenWhenGroupedBy: '*',
  },
  stack: {
    field: 'stack',
    style: {
      color: 'tomato',
    },
  },
  preferredLanguage: { field: 'preferredLanguage' },
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

const defaultSortInfo: DataSourcePropSortInfo<Developer> = [
  {
    field: ['stack', 'preferredLanguage'],
    dir: -1,
    id: 'group-by',
  },
];

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

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

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      [defaultSortInfo]="defaultSortInfo"
      [groupBy]="groupBy"
    >
      <infinite-table
        debugId="group-column-sorted-initially-example"
        [groupColumn]="groupColumn"
        [columns]="columns"
        [hideColumnWhenGrouped]="true"
        [columnDefaultWidth]="250"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly columns = columns;
  protected readonly dataSource = dataSource;
  protected readonly defaultSortInfo = defaultSortInfo;
  protected readonly groupBy = groupBy;
  protected readonly groupColumn = groupColumn;
}
