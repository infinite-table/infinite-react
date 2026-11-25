
import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceApi,
  DataSourceDataFn,
  InfiniteTableApi,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const columns: Record<string, any> = {
  id: { field: 'id' },
  salary: { field: 'salary' },
  age: { field: 'age' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  lastName: { field: 'lastName' },
  country: { field: 'country' },
  city: { field: 'city' },
  currency: { field: 'currency' },
  stack: { field: 'stack' },
  canDesign: { field: 'canDesign' },
};

const dataSourceFn: DataSourceDataFn<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql`)
    .then((r) => r.json())
    .then((data) => {
      return new Promise((resolve) => {
        resolve(data);
      });
    });
};

const domProps = {
  style: {
    margin: '5px',
    height: '1200px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div class="flex gap-2 items-center justify-center m-1">
      <button (click)="onUpdateClick()">update</button>
      <button (click)="onRemoveRowClick()">remove row</button>
      <button (click)="onUpdateDataSourceClick()">update datasource</button>
      <button (click)="onToggleHeaderClick()">toggle header</button>
    </div>
    <infinite-data-source [data]="ds()" primaryKey="id">
      <infinite-table
        [header]="header()"
        (activeCellIndexChange)="onActiveCellIndexChange($event)"
        debugId="test"
        (ready)="onReady($event)"
        [defaultActiveCellIndex]="initialActiveCellIndex"
        [domProps]="domProps"
        [columnDefaultWidth]="100"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ScrollingPage {
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  protected readonly ds = signal<DataSourceDataFn<Developer>>(dataSourceFn);
  protected readonly header = signal(true);

  protected readonly initialActiveCellIndex: [number, number] = [0, 2];
  private activeCellIndex: [number, number] | null = this.initialActiveCellIndex;

  private dataSourceApi: DataSourceApi<Developer> | null = null;
  private api: InfiniteTableApi<Developer> | null = null;

  protected onReady(params: {
    dataSourceApi: DataSourceApi<Developer>;
    api: InfiniteTableApi<Developer>;
  }) {
    this.dataSourceApi = params.dataSourceApi;
    this.api = params.api;
  }

  protected onActiveCellIndexChange(index: [number, number] | null | undefined) {
    this.activeCellIndex = index ?? null;
  }

  protected onUpdateClick() {
    const { dataSourceApi, api } = this;
    if (!dataSourceApi || !api) {
      return;
    }

    const { start, end } = api.getVisibleRenderRange();
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;

    const randomRow =
      Math.floor(Math.random() * (endRow - startRow + 1)) + startRow;
    const randomCol =
      Math.floor(Math.random() * (endCol - startCol + 1)) + startCol;

    const [activeRow, activeCol] = this.activeCellIndex || [];

    const updateRow = activeRow ?? randomRow;
    const updateCol = activeCol ?? randomCol;
    const colId = Object.keys(columns)[updateCol];
    const rowId = dataSourceApi.getPrimaryKeyByIndex(updateRow);
    dataSourceApi.updateData({
      [colId]: Math.floor(Math.random() * 10000),
      id: rowId,
    });
  }

  protected onRemoveRowClick() {
    const { dataSourceApi, api } = this;
    if (!dataSourceApi || !api) {
      return;
    }

    const [activeRow] = this.activeCellIndex || [];
    const rowId = dataSourceApi.getPrimaryKeyByIndex(activeRow as number);
    dataSourceApi.removeData({ id: rowId });
  }

  protected onUpdateDataSourceClick() {
    this.ds.set(dataSourceFn.bind(null));
  }

  protected onToggleHeaderClick() {
    this.header.set(!this.header());
  }
}
