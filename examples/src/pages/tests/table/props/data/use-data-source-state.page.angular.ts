import { Component } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  injectDataSourceState,
} from '@infinite-table/infinite-angular';
import type { DataSourceState } from '@infinite-table/infinite-angular';
import type { CarSale } from '@examples/datasets/CarSale';

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
  selector: 'app-grid',
  imports: [InfiniteTable],
  template: `
    <div>
      <p data-name="test">Showing {{ dataArrayLength() }} rows.</p>
      <infinite-table debugId="test" [domProps]="domProps" [columns]="columns" />
    </div>
  `,
})
class AppGrid {
  protected readonly dataArrayLength = injectDataSourceState(
    (state: DataSourceState<CarSale>) => state.dataArray.length,
  );
  protected readonly domProps = domProps;
  protected readonly columns = columns;
}

@Component({
  imports: [DataSource, AppGrid],
  template: `
    <infinite-data-source
      [data]="carsales"
      primaryKey="id"
      [defaultGroupBy]="defaultGroupBy"
      [defaultGroupRowsState]="groupRowsState"
    >
      <app-grid />
    </infinite-data-source>
  `,
})
export default class UseDataSourceStatePage {
  protected readonly carsales = carsales;

  protected readonly groupRowsState = {
    expandedRows: true as const,
    collapsedRows: [[2010]],
  };

  protected readonly defaultGroupBy = [{ field: 'year' as const }];
}
