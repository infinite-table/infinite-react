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
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: {
    field: 'firstName',
  },
  stack: {
    field: 'stack',
  },
  age: { field: 'age' },
  id: { field: 'id' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div style="color: var(--infinite-cell-color); padding: 10px">
      Keyboard selection is now
      <b>{{ keyboardSelection() ? 'enabled' : 'disabled' }}</b>.
      <button
        style="border: 1px solid tomato; display: block; padding: 5px; margin-top: 10px"
        (click)="keyboardSelection.set(!keyboardSelection())"
      >
        Click to toggle keyboard selection
      </button>
    </div>
    <infinite-data-source [data]="dataSource" selectionMode="multi-row" primaryKey="id">
      <infinite-table
        debugId="default-selection-mode-multi-row-keyboard-toggle-example"
        [keyboardSelection]="keyboardSelection()"
        [columns]="columns"
        [columnDefaultWidth]="150"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;

  protected readonly keyboardSelection = signal(true);
}
