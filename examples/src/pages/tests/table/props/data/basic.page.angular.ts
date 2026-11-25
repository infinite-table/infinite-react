import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { carsales, carSaleBasicColumns as columns } from './common';

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
    <button (click)="active.set([!active()[0], active()[1]])">toggle test</button>
    @if (active()[0]) {
      <infinite-data-source [data]="carsales" primaryKey="id">
        <infinite-table debugId="test" [domProps]="domProps" [columns]="columns" />
      </infinite-data-source>
    }
    <button (click)="active.set([active()[0], !active()[1]])">Toggle simple</button>
    @if (active()[1]) {
      <infinite-data-source [data]="carsales" primaryKey="id" selectionMode="multi-row">
        <infinite-table debugId="simple" [domProps]="domProps" [columns]="simpleColumns" />
      </infinite-data-source>
    }
  `,
})
export default class BasicPage {
  protected readonly active = signal([true, true]);
  protected readonly carsales = carsales;
  protected readonly columns = columns;
  protected readonly simpleColumns = { make: columns.make };
  protected readonly domProps = domProps;
}
