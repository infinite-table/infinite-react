import { Component } from '@angular/core';
import sinon from 'sinon';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import {
  type Developer as BaseDeveloper,
  developersData5,
  height100DomProps,
} from '../common';

type Developer = BaseDeveloper & { salary: number };

const data: Developer[] = developersData5.map((row, i) => ({
  ...row,
  salary: [123, 11000, 12000, 21000, 9000][i],
}));

const columns: Record<string, any> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
    style: ({ inEdit }: { inEdit: boolean }) => {
      return inEdit
        ? {
            fontSize: '30px',
          }
        : {};
    },
  },
  age: {
    field: 'age',
    type: 'number',
    defaultEditable: false,
  },
  stack: {
    field: 'stack',
    renderMenuIcon: false,
    valueGetter: ({ data }: { data: Developer }) => `Stack: ${data.stack}`,
  },
  currency: { field: 'currency' },
  salary: {
    field: 'salary',
    style: ({ rawValue }: { rawValue: number }) => {
      return rawValue > 1000
        ? {
            color: 'red',
          }
        : { color: 'blue' };
    },
    valueFormatter: ({ value }: { value: number }) => `$ ${value}`,
    getValueToPersist: ({ value }: { value: string }) => {
      return parseInt(value, 10) * 2;
    },
  },
};

const onEditCancelled = sinon.spy(() => {});
const onEditRejected = sinon.spy(() => {});
const onEditAccepted = sinon.spy(() => {});

(globalThis as any).onEditCancelled = onEditCancelled;
(globalThis as any).onEditAccepted = onEditAccepted;
(globalThis as any).onEditRejected = onEditRejected;

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        (editCancelled)="onEditCancelled($event)"
        (editAccepted)="onEditAccepted($event)"
        (editRejected)="onEditRejected($event)"
        [columnDefaultEditable]="true"
        [columnDefaultWidth]="150"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ColumnWithFormatterGetValueToPersistPage {
  protected readonly data = data;
  protected readonly domProps = height100DomProps;
  protected readonly columns = columns;
  protected readonly onEditCancelled = onEditCancelled;
  protected readonly onEditAccepted = onEditAccepted;
  protected readonly onEditRejected = onEditRejected;
}
