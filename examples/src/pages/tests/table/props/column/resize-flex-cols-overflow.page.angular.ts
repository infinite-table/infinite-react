import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

import sinon from 'sinon';

type Row = {
  id: number;
  label: string;
  a: number;
  b: number;
  c: number;
};

const data: Row[] = [...new Array(10)].map((_, i) => ({
  id: i,
  label: `Row ${i}`,
  a: i,
  b: i * 2,
  c: i * 3,
}));

// the fixed columns alone (3 x 200) exceed the grid width (500), so the only
// flex column (`label`) is stuck at the min width - see the React sibling
const columns: InfiniteTablePropColumns<Row> = {
  label: { field: 'label', defaultFlex: 1, renderMenuIcon: false },
  a: { field: 'a', defaultWidth: 200, renderMenuIcon: false },
  b: { field: 'b', defaultWidth: 200, renderMenuIcon: false },
  c: { field: 'c', defaultWidth: 200, renderMenuIcon: false },
};

const onColumnSizingChangeSpy = sinon.spy((_columnSizing: any) => {});

(globalThis as any).onColumnSizingChange = onColumnSizingChangeSpy;

const domProps = {
  style: {
    margin: '5px',
    height: '400px',
    width: '500px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const onColumnSizingChange = (columnSizing: any) => {
  onColumnSizingChangeSpy(columnSizing);
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="data" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        [columnMinWidth]="50"
        (columnSizingChange)="onColumnSizingChange($event)"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ResizeFlexColsOverflowPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly onColumnSizingChange = onColumnSizingChange;
}
