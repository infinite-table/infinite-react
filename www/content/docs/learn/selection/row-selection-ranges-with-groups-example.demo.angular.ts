import { Component, signal } from '@angular/core';

import {
  DataSource,
  GroupRowsState,
  InfiniteTable,
} from '@infinite-table/infinite-angular';
import type {
  DataSourcePropGroupBy,
  DataSourcePropRowSelection,
  DataSourcePropRowSelection_MultiRow,
  InfiniteTableApi,
  InfiniteTablePropColumns,
  InfiniteTablePropMultiRowSelectionWith,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  name: string;
  language: string;
};

const data: Developer[] = [
  { id: 1, name: 'TS 1', language: 'TypeScript' },
  { id: 2, name: 'TS 2', language: 'TypeScript' },
  { id: 3, name: 'TS 3', language: 'TypeScript' },
  { id: 4, name: 'Go 1', language: 'Go' },
  { id: 5, name: 'Go 2', language: 'Go' },
  { id: 6, name: 'Rust 1', language: 'Rust' },
  { id: 7, name: 'Rust 2', language: 'Rust' },
  { id: 8, name: 'Rust 3', language: 'Rust' },
];

const columns: InfiniteTablePropColumns<Developer> = {
  name: { field: 'name' },
  language: { field: 'language' },
};

const groupBy: DataSourcePropGroupBy<Developer> = [{ field: 'language' }];

// the Go group starts collapsed
const defaultGroupRowsState = new GroupRowsState({
  expandedRows: true,
  collapsedRows: [['Go']],
});

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div
      style="
        color: var(--infinite-cell-color);
        padding: 10px;
        display: flex;
        gap: 20px;
        align-items: center;
      "
    >
      <label>
        multiRowSelectionWith:
        <select [value]="selectWith()" (change)="onSelectWithChange($event)">
          <option value="click">click</option>
          <option value="checkbox">checkbox</option>
        </select>
      </label>
      <span>Selected: {{ selected().join(', ') || 'none' }}</span>
    </div>
    <infinite-data-source
      [data]="data"
      primaryKey="id"
      selectionMode="multi-row"
      [groupBy]="groupBy"
      [defaultGroupRowsState]="defaultGroupRowsState"
      (rowSelectionChange)="onRowSelectionChange($event)"
    >
      <infinite-table
        [columns]="columns"
        [columnDefaultWidth]="150"
        groupRenderStrategy="single-column"
        [multiRowSelectionWith]="selectWith()"
        (ready)="api = $event.api"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly defaultGroupRowsState = defaultGroupRowsState;

  protected readonly selectWith =
    signal<InfiniteTablePropMultiRowSelectionWith>('click');
  protected readonly selected = signal<string[]>([]);

  protected api: InfiniteTableApi<Developer> | null = null;

  protected onSelectWithChange(event: Event) {
    this.selectWith.set(
      (event.target as HTMLSelectElement)
        .value as InfiniteTablePropMultiRowSelectionWith,
    );
  }

  protected onRowSelectionChange(
    rowSelection: DataSourcePropRowSelection | undefined,
  ) {
    // selectionMode="multi-row": the selection is an object
    const ids = this.api?.rowSelectionApi.getSelectedPrimaryKeys(
      rowSelection as DataSourcePropRowSelection_MultiRow,
    );
    this.selected.set(
      data.filter((d) => ids?.includes(d.id)).map((d) => d.name),
    );
  }
}
