import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTableColumnGroup,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  currency: {
    field: 'currency',
    columnGroup: 'finance',
    maxWidth: 130,
  },
  salary: {
    field: 'salary',
    columnGroup: 'finance',
    maxWidth: 130,
  },
  country: {
    field: 'country',
    columnGroup: 'regionalInfo',
    maxWidth: 400,
  },
  preferredLanguage: {
    field: 'preferredLanguage',
    columnGroup: 'regionalInfo',
  },
  id: { field: 'id', defaultWidth: 80 },
  firstName: {
    field: 'firstName',
  },
  stack: {
    field: 'stack',
  },
};

const columnGrous: Record<string, InfiniteTableColumnGroup> = {
  regionalInfo: {
    header: 'Regional Info',
  },
  finance: {
    header: 'Finance',
    columnGroup: 'regionalInfo',
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="column-groups-example"
        [columnGroups]="columnGrous"
        [columns]="columns"
        [columnDefaultWidth]="100"
      />
    </infinite-data-source>
  `,
})
export default class ColumnGroupsExample {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly columnGrous = columnGrous;
}
