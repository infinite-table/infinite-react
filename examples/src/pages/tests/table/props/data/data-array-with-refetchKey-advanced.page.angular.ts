import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourceApi } from '@infinite-table/infinite-angular';
import type { CarSale } from '@examples/datasets/CarSale';

const carsales: CarSale[] = [
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 2WD',
    year: 2010,
    sales: 15,
    color: 'red',
    id: 0,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2007,
    sales: 1,
    color: 'red',
    id: 1,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2008,
    sales: 2,
    color: 'magenta',
    id: 2,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2009,
    sales: 136,
    color: 'blue',
    id: 3,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2010,
    color: 'blue',
    sales: 30,
    id: 4,
  },
];

const columns: Record<string, any> = {
  make: { field: 'make' },
  model: { field: 'model' },

  category: {
    field: 'category',
  },
  count: {
    field: 'sales',
  },
  year: {
    field: 'year',
    type: 'number',
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="onAddItemClick()">add item</button>

    <infinite-data-source
      [data]="carsales"
      primaryKey="id"
      [refetchKey]="refetchKey()"
      (ready)="onReady($event)"
    >
      <infinite-table [domProps]="domProps" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class DataArrayWithRefetchKeyAdvancedPage {
  protected readonly carsales = carsales;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  protected readonly refetchKey = signal(0);

  private dataSourceApi: DataSourceApi<CarSale> | null = null;

  protected onReady(api: DataSourceApi<CarSale>) {
    this.dataSourceApi = api;
  }

  protected onAddItemClick() {
    /**
     * make an update so as to store state.originalDataArray
     */
    this.dataSourceApi!.updateData({
      id: 1,
      make: 'Acura',
      model: 'RDX 2WD',
      year: 2010,
      sales: 15,
      color: 'red',
    });

    setTimeout(() => {
      carsales.length = 1;
      // and just after that we refresh the refetchKey
      this.refetchKey.set(this.refetchKey() + 1);
    }, 50);
  }
}
