import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

import { EXPIRED_LICENSE_KEY } from './expiredLicenseKey';

type Person = {
  id: number;
  firstName: string;
  age: number;
};

const data: Person[] = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  firstName: `Person ${index}`,
  age: 20 + index,
}));

const columns: InfiniteTablePropColumns<Person> = {
  id: { field: 'id', type: 'number' },
  firstName: { field: 'firstName' },
  age: { field: 'age', type: 'number' },
};

const domProps = {
  style: { height: '80vh' },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table
        [licenseKey]="licenseKey"
        [columns]="columns"
        [columnDefaultWidth]="150"
        [domProps]="domProps"
      />
    </infinite-data-source>
  `,
})
export default class ExpiredLicensePage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly licenseKey = EXPIRED_LICENSE_KEY;
}
