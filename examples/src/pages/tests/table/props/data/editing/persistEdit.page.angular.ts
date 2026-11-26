import { Component } from '@angular/core';
import sinon from 'sinon';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { data, height100DomProps } from './common';

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
    defaultEditable: false,
  },
  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

const onEditCancelled = sinon.spy(() => {});
const onEditAccepted = sinon.spy(() => {});
const onEditPersistError = sinon.spy(() => {});
const onEditPersistSuccess = sinon.spy(() => {});

(globalThis as any).onEditCancelled = onEditCancelled;
(globalThis as any).onEditAccepted = onEditAccepted;
(globalThis as any).onEditPersistError = onEditPersistError;
(globalThis as any).onEditPersistSuccess = onEditPersistSuccess;

const persistEdit = ({
  value,
  dataSourceApi,
  data,
  column,
}: {
  value: any;
  dataSourceApi: any;
  data: any;
  column: any;
}) => {
  if (column.id === 'id') {
    return new Error('Cannot edit id');
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        dataSourceApi.updateData({
          ...data,
          [column.field!]: value + '!',
        }),
      );
    }, 200);
  });
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        (editCancelled)="onEditCancelled($event)"
        (editAccepted)="onEditAccepted($event)"
        (editPersistError)="onEditPersistError($event)"
        (editPersistSuccess)="onEditPersistSuccess($event)"
        [persistEdit]="persistEdit"
        [columnDefaultEditable]="true"
        [columnDefaultWidth]="150"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class PersistEditPage {
  protected readonly data = data;
  protected readonly domProps = height100DomProps;
  protected readonly columns = columns;
  protected readonly persistEdit = persistEdit;
  protected readonly onEditCancelled = onEditCancelled;
  protected readonly onEditAccepted = onEditAccepted;
  protected readonly onEditPersistError = onEditPersistError;
  protected readonly onEditPersistSuccess = onEditPersistSuccess;
}
