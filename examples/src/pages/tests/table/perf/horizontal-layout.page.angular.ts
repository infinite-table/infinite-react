import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropCellSelection_MultiCell,
  InfiniteTableApi,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  country: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
  salary: number;
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    // defaultWidth: 50,
  },
  canDesign: {
    field: 'canDesign',
    defaultWidth: 150,
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultWidth: 80,
  },
  firstName: {
    field: 'firstName',
    defaultWidth: 120,
  },
  age: {
    field: 'age',
    type: 'number',
    defaultWidth: 90,
  },

  stack: { field: 'stack', renderMenuIcon: false, defaultWidth: 110 },
  // currency: { field: 'currency' },
  // country: { field: 'country' },
};

const domProps = {
  // style: { height: 420 /*30px header, 420 body*/, width: 230 },
  style: { height: '50vh' /*30px header, 420 body*/, width: '80vw' },
};

const data: Developer[] = Array.from({ length: 5000 }, (_, i) => ({
  id: i,
  preferredLanguage: `Lang ${i}`,
  age: i * 10,
  salary: i * 1000,
  firstName: `John ${i}`,
  lastName: `Doe ${i}`,
  currency: `USD ${i}`,
  country: `USA ${i}`,
  canDesign: i % 2 === 0 ? ('yes' as const) : ('no' as const),
  stack: i % 2 === 0 ? 'frontend' : 'backend',
}));

const defaultCellSelection: DataSourcePropCellSelection_MultiCell = {
  defaultSelection: false,
  selectedCells: [],
};

(globalThis as any).INFINITE_API = null;

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="wrapRowsHorizontally.set(!wrapRowsHorizontally())">
      toggle
    </button>
    <input type="text" value="" />
    <!-- React remounts the DataSource when the flag changes (key=...) -->
    @for (wrap of [wrapRowsHorizontally()]; track wrap) {
      <infinite-data-source
        primaryKey="id"
        [data]="data"
        [defaultCellSelection]="defaultCellSelection"
      >
        <infinite-table
          (ready)="onReady($event)"
          [wrapRowsHorizontally]="wrap"
          [rowHeight]="50"
          [domProps]="domProps"
          [header]="true"
          [columnHeaderHeight]="30"
          [columns]="columns"
          keyboardNavigation="cell"
          [columnDefaultWidth]="100"
          (cellClick)="onCellClick($event)"
        />
      </infinite-data-source>
    }
  `,
})
export default class HorizontalLayoutPage {
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly data = data;
  protected readonly defaultCellSelection = defaultCellSelection;

  protected readonly wrapRowsHorizontally = signal(true);

  protected onReady({ api }: { api: InfiniteTableApi<Developer> }) {
    (globalThis as any).INFINITE_API = api;
  }

  protected onCellClick({
    rowIndex,
    colIndex,
  }: {
    rowIndex: number;
    colIndex: number;
  }) {
    console.log('clicked', rowIndex, colIndex);
  }
}
