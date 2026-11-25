import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { carsales, carSaleBasicColumns as columns } from './common';

const onKeyDown = (context: any) => {
  const { activeCellIndex } = context.getState();

  if (!activeCellIndex) {
    return;
  }

  const col = context.api.getColumnAtIndex(activeCellIndex[1]);
  if (!col) {
    return;
  }

  if (col.field === 'model') {
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
        [onKeyDown]="onKeyDown"
        [columnDefaultEditable]="true"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class OnCellEnterKeyWithPreventEditPage {
  protected readonly carsales = carsales;
  protected readonly columns = columns;
  protected readonly onKeyDown = onKeyDown;
  protected readonly domProps = {
    style: {
      margin: '5px',
      height: '900px',
      border: '1px solid gray',
      position: 'relative' as const,
    },
  };
}
