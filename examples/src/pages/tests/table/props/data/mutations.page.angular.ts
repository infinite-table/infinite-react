import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourceApi } from '@infinite-table/infinite-angular';

import {
  type Developer,
  developersData5 as data,
  mark,
  height100DomProps,
} from './common';

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
    defaultEditable: true,
    getValueToPersist: ({ value }: { value: any }) => {
      return !isNaN(Number(value)) ? Number(value) : value;
    },
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

const beforeMark: Developer = {
  id: 7,
  firstName: 'Before Mark',
  lastName: 'Before',
  age: 39,
  canDesign: 'no',
  currency: 'USD',
  preferredLanguage: 'Go',
  stack: 'frontend',
};

(globalThis as any).mutations = undefined;

const onDataMutations = ({ mutations }: { mutations: any }) => {
  console.log(mutations);
  (globalThis as any).mutations = mutations;
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="onAddClick()">Add 2 items</button>

    <button (click)="onUpdateClick()">Update id=2 to age=100</button>

    <button (click)="onClearClick()">Clear all data</button>

    <infinite-data-source
      [data]="data"
      primaryKey="id"
      (ready)="onReady($event)"
      (dataMutations)="onDataMutations($event)"
    >
      <infinite-table
        [domProps]="domProps"
        [columnSizing]="columnSizing"
        [columnDefaultWidth]="100"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class MutationsPage {
  protected readonly data = data;
  protected readonly domProps = height100DomProps;
  protected readonly columns = columns;
  protected readonly onDataMutations = onDataMutations;
  protected readonly columnSizing = {
    id: {
      width: 500,
    },
  };

  private dataSourceApi: DataSourceApi<Developer> | null = null;

  protected onReady(api: DataSourceApi<Developer>) {
    this.dataSourceApi = api;
  }

  protected onAddClick() {
    this.dataSourceApi!.addData(mark);
    this.dataSourceApi!.insertData(beforeMark, {
      position: 'before',
      primaryKey: 6,
    });
  }

  protected onUpdateClick() {
    this.dataSourceApi!.updateData({
      id: 2,
      age: 100,
    });
  }

  protected onClearClick() {
    this.dataSourceApi!.clearAllData();
  }
}
