import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 60 },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },
  salary: { field: 'salary', type: 'number' },
  currency: { field: 'currency', type: 'number' },
};

const currentColumns: InfiniteTablePropColumns<Developer> = {
  ...columns,
  id: {
    field: 'id',
    defaultWidth: 60,
    renderSelectionCheckBox: true,
  },
};

type SelectionMode = 'multi-cell' | 'multi-row';

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div
      style="display: flex; flex: 1; color: var(--infinite-cell-color); flex-flow: column; background: var(--infinite-background)"
    >
      <p style="padding: 10px">Please select the selection mode</p>
      <div style="padding: 10px; padding-top: 0">
        <select
          style="margin: 10px 0; display: inline-block; background: var(--infinite-background); color: currentColor; padding: var(--infinite-space-3)"
          [value]="selectionMode()"
          (change)="onSelectionModeChange($event)"
        >
          <option value="multi-cell">multi-cell</option>
          <option value="multi-row">multi-row</option>
        </select>
      </div>
      <infinite-data-source
        primaryKey="id"
        [data]="dataSource"
        [selectionMode]="selectionMode()"
      >
        <infinite-table
          debugId="selectionMode-example"
          [columns]="currentColumns"
          [columnDefaultWidth]="100"
        />
      </infinite-data-source>
    </div>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly currentColumns = currentColumns;

  protected readonly selectionMode = signal<SelectionMode>('multi-cell');

  protected onSelectionModeChange(event: Event) {
    this.selectionMode.set(
      (event.target as HTMLSelectElement).value as SelectionMode,
    );
  }
}
