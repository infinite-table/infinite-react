import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumnGroups,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type TestCols = {
  id: string;
  a1: string;
  b1: string;
  c1: string;
  d1: string;
  a2: string;
  b2: string;
  c2: string;
  d2: string;
  a3: string;
  b3: string;
  c3: string;
  d3: string;
};

const columns: InfiniteTablePropColumns<TestCols> = {
  a1: { field: 'a1', columnGroup: '1' },
  b1: { field: 'b1', columnGroup: '1' },
  c1: { field: 'c1', columnGroup: '1' },
  d1: { field: 'd1', columnGroup: '1' },
  a2: { field: 'a2', columnGroup: '2' },
  b2: { field: 'b2', columnGroup: '2' },
  c2: { field: 'c2', columnGroup: '2' },
  d2: { field: 'd2', columnGroup: '2' },
  a3: { field: 'a3', columnGroup: '3' },
  b3: { field: 'b3', columnGroup: '3' },
  c3: { field: 'c3', columnGroup: '3' },
  d3: { field: 'd3', columnGroup: '3' },
};

const columnGroups: InfiniteTablePropColumnGroups = {
  1: { header: 'One' },
  2: { header: 'Two' },
  3: { header: 'Three' },
};

const data: TestCols[] = [];

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    width: '80vw',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="toggleGroup('1')">toggle group 1</button>
    <button (click)="toggleGroup('2')">toggle group 2</button>
    <button (click)="toggleGroup('3')">toggle group 3</button>
    <infinite-data-source primaryKey="id" [data]="data">
      <infinite-table
        [domProps]="domProps"
        [columnGroupVisibility]="columnGroupVisibility()"
        draggableColumnsRestrictTo="group"
        [columnGroups]="columnGroups"
        [columns]="columns"
        [columnDefaultWidth]="90"
      />
    </infinite-data-source>
  `,
})
export default class ColumnGroupColumnReorderTestPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly columnGroups = columnGroups;
  protected readonly domProps = domProps;
  protected readonly columnGroupVisibility = signal<Record<string, boolean>>({
    1: true,
    2: true,
    3: true,
  });

  protected toggleGroup(groupId: string) {
    this.columnGroupVisibility.update((visibility) => ({
      ...visibility,
      [groupId]: !visibility[groupId],
    }));
  }
}
