import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourceSortInfo } from '@infinite-table/infinite-angular';
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
  y: {
    valueGetter: ({ data }: { data: CarSale }) => data.year,
    renderValue: ({ data }: { data: CarSale | null }) => data?.year,
    header: 'Year',
    dataType: 'number',
  },
};

const defaultSortInfo: DataSourceSortInfo<CarSale> = [
  {
    valueGetter: (data: CarSale) => data.year,
    dir: 1,
    type: 'number',
    id: 'y',
  },
];

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
    >
      <infinite-table [domProps]="domProps" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class DatasourceDefaultSortInfoValueGetterPage {
  protected readonly carsales = carsales;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly defaultSortInfo = defaultSortInfo;
}
