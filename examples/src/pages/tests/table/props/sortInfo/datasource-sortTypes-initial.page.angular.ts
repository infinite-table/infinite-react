import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourceSortInfo } from '@infinite-table/infinite-angular';
import type { CarSale } from '@examples/datasets/CarSale';

import { carsales } from './common';

const columns: Record<string, any> = {
  make: { field: 'make' },
  model: { field: 'model' },
  color: { field: 'color' /*, sortType: 'color'*/ },

  category: {
    field: 'category',
  },
  sales: {
    field: 'sales',
    sortType: 'number',
  },
  year: {
    field: 'year',
    sortType: 'number',
  },
};

const defaultSortInfo: DataSourceSortInfo<CarSale> = [
  {
    field: 'color',
    type: 'color',
    dir: 1,
  },
];

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
      [defaultSortInfo]="defaultSortInfo"
      [sortTypes]="sortTypes"
    >
      <infinite-table [domProps]="domProps" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class DataSourceSortTypesInitialPage {
  protected readonly carsales = carsales;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly defaultSortInfo = defaultSortInfo;
  protected readonly sortTypes = sortTypes;
}
