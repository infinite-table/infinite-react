import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
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

    <infinite-data-source [data]="carsales" primaryKey="id" [refetchKey]="refetchKey()">
      <infinite-table [domProps]="domProps" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class DataArrayWithRefetchKeyPage {
  protected readonly carsales = carsales;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  protected readonly refetchKey = signal(0);

  protected onAddItemClick() {
    carsales.push({
      category: '1 - Category 1 Truck',
      make: 'Acura',
      model: 'RDX 2WD',
      year: 2010,
      sales: 15,
      color: 'red',
      id: 1,
    });
    this.refetchKey.set(this.refetchKey() + 1);
  }
}
