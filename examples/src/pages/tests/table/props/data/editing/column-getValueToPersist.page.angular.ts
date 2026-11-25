import { Component } from '@angular/core';
import sinon from 'sinon';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { dataWithSalary as data, height100DomProps } from './common';

const columns: Record<string, any> = {
  id: {
    field: 'id',
    header: 'ID',
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
  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
  salary: {
    field: 'salary',
    getValueToEdit: ({ value }: { value: string }) => value.substr(1).trim(),
    getValueToPersist: ({
      value,
      initialValue,
    }: {
      value: string;
      initialValue: string;
    }) => {
      return `${initialValue[0]} ${value}`;
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
export default class ColumnGetValueToPersistPage {
  protected readonly data = data;
  protected readonly domProps = height100DomProps;
  protected readonly columns = columns;
  protected readonly onEditCancelled = onEditCancelled;
  protected readonly onEditAccepted = onEditAccepted;
  protected readonly onEditRejected = onEditRejected;
}
