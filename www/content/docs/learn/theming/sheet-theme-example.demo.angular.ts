import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumnPinning,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Row = { id: number; region: string; q1: number; q2: number; q3: number };

const REGIONS = ['North', 'South', 'East', 'West', 'Central'];

const data: Row[] = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  region: REGIONS[i % REGIONS.length],
  q1: 1000 + ((i * 337) % 900),
  q2: 1000 + ((i * 511) % 900),
  q3: 1000 + ((i * 719) % 900),
}));

const columns: InfiniteTablePropColumns<Row> = {
  // a pinned row number column - styled like the row headers of a spreadsheet
  rowNumber: {
    header: '',
    defaultWidth: 50,
    align: 'center',
    renderValue: ({ rowInfo }) => rowInfo.indexInAll + 1,
  },
  region: { field: 'region', header: 'Region' },
  q1: { field: 'q1', header: 'Q1', type: 'number' },
  q2: { field: 'q2', header: 'Q2', type: 'number' },
  q3: { field: 'q3', header: 'Q3', type: 'number' },
};

const defaultColumnPinning: InfiniteTablePropColumnPinning = {
  rowNumber: 'start',
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div class="infinite-theme-name--sheet" style="display: flex; flex: 1">
      <infinite-data-source [data]="data" primaryKey="id">
        <infinite-table
          [columns]="columns"
          [defaultColumnPinning]="defaultColumnPinning"
          keyboardNavigation="cell"
          [defaultActiveCellIndex]="defaultActiveCellIndex"
        />
      </infinite-data-source>
    </div>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly defaultColumnPinning = defaultColumnPinning;
  protected readonly defaultActiveCellIndex: [number, number] = [2, 2];
}
