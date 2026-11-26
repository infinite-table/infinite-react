import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourceApi } from '@infinite-table/infinite-angular';

import {
  type Developer as BaseDeveloper,
  developersData5,
  mark as baseMark,
  height100DomProps,
} from './common';

type Developer = BaseDeveloper & { count?: number };

let c = 0;
function count() {
  return c;
}
const getData: () => Developer[] = () =>
  developersData5.map((row) => ({ ...row, count: count() }));

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
  count: { field: 'count', minWidth: 150 },
};

const mark: Developer = { ...baseMark, count: count() };

const beforeMark: Developer = {
  id: 7,
  firstName: 'Before Mark',
  lastName: 'Before',
  age: 39,
  canDesign: 'no',
  currency: 'USD',
  preferredLanguage: 'Go',
  stack: 'frontend',
  count: count(),
};

(globalThis as any).mutations = undefined;
(globalThis as any).onDataMutationsCalls = 0;

const onDataMutations = ({ mutations }: { mutations: any }) => {
  (globalThis as any).mutations = mutations;
  (globalThis as any).onDataMutationsCalls++;
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="onAddClick()">Add 2 items</button>

    <button (click)="onUpdateClick()">Update id=2 to age=100</button>
    <button (click)="onRefreshClick()">Refresh data</button>

    <infinite-data-source
      [data]="data()"
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
export default class MutationsNewDataPage {
  protected readonly data = signal<Developer[]>(getData());
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

  protected onRefreshClick() {
    c++;
    this.data.set(getData());
  }
}
