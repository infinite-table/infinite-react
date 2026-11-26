import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { carsales, carSaleBasicColumns as columns } from './common';

const onCellDoubleClick = (context: any) => {
  if (context.column.field === 'model') {
    return {
      preventEdit: true,
    };
  }
  return;
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="carsales" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        [onCellDoubleClick]="onCellDoubleClick"
        [columnDefaultEditable]="true"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class OnCellDoubleClickWithPreventEditPage {
  protected readonly carsales = carsales;
  protected readonly columns = columns;
  protected readonly onCellDoubleClick = onCellDoubleClick;
  protected readonly domProps = {
    style: {
      margin: '5px',
      height: '900px',
      border: '1px solid gray',
      position: 'relative' as const,
    },
  };
}
