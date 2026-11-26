import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { CarSale } from '@examples/datasets/CarSale';

import { carsales } from './common';

const columns: Record<string, any> = {
  make: { field: 'make' },
  model: { field: 'model' },
  color: { field: 'color', dataType: 'color' },

  category: {
    field: 'category',
  },
  sales: {
    field: 'sales',
    dataType: 'number',
  },
  year: {
    field: 'year',
    dataType: 'number',
  },
};

const sortTypes = {
  color: (one: string, two: string) => {
    if (one === 'magenta') {
      // magenta comes first
      return -1;
    }
    if (two === 'magenta') {
      // magenta comes first
      return 1;
    }
    return one.localeCompare(two);
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="carsales"
      primaryKey="id"
      [sortTypes]="sortTypes"
    >
      <infinite-table [domProps]="domProps" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class DatasourceSortTypesPage {
  protected readonly carsales = carsales;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly sortTypes = sortTypes;
}
