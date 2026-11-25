import { Component } from '@angular/core';
import sinon from 'sinon';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { DataSourceApi } from '@infinite-table/infinite-angular';

import {
  type Developer,
  developersData5 as data,
  mark,
  height100DomProps,
} from './common';

const onEditPersistSuccess = sinon.spy((_params: any) => {});

(globalThis as any).onEditPersistSuccess = onEditPersistSuccess;

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
      const result = !isNaN(Number(value)) ? Number(value) * 10 : value;

      return result;
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

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="onAddClick()">Add 2 items</button>

    <button (click)="onUpdateClick()">Update id=2 to age=100</button>

    <infinite-data-source [data]="data" primaryKey="id" (ready)="onReady($event)">
      <infinite-table
        [domProps]="domProps"
        [columnSizing]="columnSizing"
        (editPersistSuccess)="onEditPersistSuccess($event)"
        [columnDefaultWidth]="100"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class OnEditPersistSuccessPage {
  protected readonly data = data;
  protected readonly domProps = height100DomProps;
  protected readonly columns = columns;
  protected readonly onEditPersistSuccess = onEditPersistSuccess;
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
}
