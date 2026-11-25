import { Component } from '@angular/core';

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
    <infinite-data-source [data]="carsales" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        [showHoverRows]="false"
        [showZebraRows]="false"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class BasicNoZebraNoHoverPage {
  protected readonly carsales = carsales;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
}
