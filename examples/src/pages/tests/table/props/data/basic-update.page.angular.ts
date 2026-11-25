import { Component, computed, signal } from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
  injectColumnCell,
  injectColumnCellChildren,
} from '@infinite-table/infinite-angular';
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

// the cell override: its host is the cell, it renders the default content
// and counts its renders - one per change of the cell (or its content)
@Component({
  selector: 'div[renderCountColumnCell]',
  imports: [InfiniteRender],
  host: { '[attr.data-render-count]': 'renderCount()' },
  template: `<ng-container [infiniteRender]="children()" />`,
})
class RenderCountColumnCell {
  private readonly cell = injectColumnCell<Developer>();
  protected readonly children = injectColumnCellChildren();

  private count = 0;

  protected readonly renderCount = computed(() => {
    this.cell();
    this.children();
    return ++this.count;
  });
}

const columns: Record<string, any> = {
  // id: { field: 'id' },
  salary: {
    field: 'salary',
    header: () => {
      return `Salary ${Date.now()}`;
    },
    defaultWidth: 250,
    components: {
      ColumnCell: RenderCountColumnCell,
    },
  },
  age: {
    field: 'age',
    components: {
      ColumnCell: RenderCountColumnCell,
    },
  },
  firstName: {
    field: 'firstName',
    components: {
      ColumnCell: RenderCountColumnCell,
    },
  },
};

const dataSourceFn: DataSourceDataFn<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql`)
    .then((r) => r.json())
    .then((data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newData = [...data.data.slice(0, 2)];

          resolve(newData);
        }, 20);
      });
    });
};

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
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class BasicUpdatePage {
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  protected readonly ds = signal<DataSourceDataFn<Developer>>(dataSourceFn);
  protected readonly header = signal(true);

  private updateCount = 0;
  private activeCellIndex: [number, number] | null = null;

  private dataSourceApi: DataSourceApi<Developer> | null = null;
  private api: InfiniteTableApi<Developer> | null = null;

  protected onReady(params: {
    dataSourceApi: DataSourceApi<Developer>;
    api: InfiniteTableApi<Developer>;
  }) {
    this.dataSourceApi = params.dataSourceApi;
    this.api = params.api;
  }

  protected onActiveCellIndexChange(
    index: [number, number] | null | undefined,
  ) {
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
      Math.floor(Math.random() * (endRow - 1 - startRow + 1)) + startRow;
    const randomCol =
      Math.floor(Math.random() * (endCol - 1 - startCol + 1)) + startCol;

    const [activeRow, activeCol] = this.activeCellIndex || [];

    const updateRow = activeRow ?? randomRow;
    const updateCol = activeCol ?? randomCol;

    console.log('updating', updateRow, updateCol);
    const colId = Object.keys(columns)[updateCol];
    const rowId = dataSourceApi.getPrimaryKeyByIndex(updateRow);
    const updateCount = this.updateCount++;
    const nextValue =
      colId === 'firstName' ? `Updated ${updateCount}` : 100_000 + updateCount;

    dataSourceApi.updateData({
      [colId]: nextValue,
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
