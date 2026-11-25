import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourceApi } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
};

const data: Developer[] = [];

const columns: Record<string, any> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

(globalThis as any).mutations = undefined;

const domProps = {
  style: {
    height: '100%',
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="onInsertClick()">Insert item</button>

    <infinite-data-source [data]="data" primaryKey="id" (ready)="onReady($event)">
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="100"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class InsertDataArrayEdgeCasePage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  private dataSourceApi: DataSourceApi<Developer> | null = null;

  protected onReady(api: DataSourceApi<Developer>) {
    this.dataSourceApi = api;
  }

  protected onInsertClick() {
    const dataSourceApi = this.dataSourceApi;
    dataSourceApi!
      .insertDataArray(
        [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Bob',
            age: 20,
            canDesign: 'yes',
            currency: 'USD',
            preferredLanguage: 'JavaScript',
            stack: 'frontend',
          },
          {
            id: 2,
            firstName: 'Hapson',
            lastName: 'Twain',
            age: 31,
            canDesign: 'yes',
            currency: 'CAD',
            preferredLanguage: 'Rust',
            stack: 'backend',
          },
        ],
        {
          position: 'end',
        },
      )
      .then(() => {
        console.log(dataSourceApi?.getRowInfoArray());
      });
  }
}
