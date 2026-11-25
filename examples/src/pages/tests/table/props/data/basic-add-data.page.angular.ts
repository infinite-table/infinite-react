import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourceApi } from '@infinite-table/infinite-angular';
import type { CarSale } from '@examples/datasets/CarSale';

import { carsales } from './common';

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
    <button (click)="onInsertClick()">Insert row after ID=1</button>
    <infinite-data-source [data]="carsales" primaryKey="id" (ready)="onReady($event)">
      <infinite-table [domProps]="domProps" [columns]="columns" />
    </infinite-data-source>
  `,
})
export default class BasicAddDataPage {
  protected readonly carsales = carsales;
  protected readonly domProps = domProps;

  protected readonly columns: Record<string, any> = {
    id: { field: 'id', defaultWidth: 80 },
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

  private dataSourceApi: DataSourceApi<CarSale> | null = null;

  protected onReady(api: DataSourceApi<CarSale>) {
    this.dataSourceApi = api;
  }

  protected onInsertClick() {
    this.dataSourceApi?.insertDataArray(
      [
        {
          id: 9,
          make: 'test',
          model: 'test',
          category: 'test',
          year: 2024,
          sales: 1,
          color: 'test',
        },
        {
          id: 10,
          make: 'test',
          model: 'test',
          category: 'test',
          year: 2024,
          sales: 1,
          color: 'test',
        },
      ],
      {
        position: 'after',
        primaryKey: 0,
      },
    );
  }
}
