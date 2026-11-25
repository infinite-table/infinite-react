import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTableColumn,
  InfiniteTableColumnGroup,
} from '@infinite-table/infinite-angular';

import { data } from './column-groups-data';
import type { Person } from './column-groups-data';

const columnGroups: Record<string, InfiniteTableColumnGroup> = {
  'contact info': { header: 'Contact info' },

  street: { header: 'street', columnGroup: 'address' },
  location: { header: 'location', columnGroup: 'address' },
  address: { header: 'Address' },
};

const columns: Record<string, InfiniteTableColumn<Person>> = {
  id: { field: 'id' },

  streetNo: { field: 'streetNo', columnGroup: 'street' },
  city: { field: 'city', columnGroup: 'location' },

  streetName: {
    field: 'streetName',
    columnGroup: 'street',
  },
  firstName: { field: 'firstName' },

  country: { field: 'country', columnGroup: 'location' },
  region: { field: 'region', columnGroup: 'location' },

  email: { field: 'email', columnGroup: 'contact info' },
  phone: { field: 'phone', columnGroup: 'contact info' },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table
        debugId="column-groups-example"
        [columnGroups]="columnGroups"
        [columnDefaultWidth]="130"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columnGroups = columnGroups;
  protected readonly columns = columns;
}
