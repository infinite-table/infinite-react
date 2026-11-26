import { Component } from '@angular/core';
import sinon from 'sinon';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { data, height100DomProps } from './common';

const columns: Record<string, any> = {
  id: {
    field: 'id',
    defaultEditable: false,
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
};

const onEditCancelled = sinon.spy(() => {});
const onEditAccepted = sinon.spy(() => {});

(globalThis as any).onEditCancelled = onEditCancelled;
(globalThis as any).onEditAccepted = onEditAccepted;

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        (editCancelled)="onEditCancelled($event)"
        (editAccepted)="onEditAccepted($event)"
        [columnDefaultEditable]="true"
        [columnDefaultWidth]="150"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ColumnDefaultEditablePage {
  protected readonly data = data;
  protected readonly domProps = height100DomProps;
  protected readonly columns = columns;
  protected readonly onEditCancelled = onEditCancelled;
  protected readonly onEditAccepted = onEditAccepted;
}
