import { Component, computed, signal } from '@angular/core';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumns,
  DataSourcePropCellSelection_MultiCell,
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

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div
      style="
        display: flex;
        flex: 1;
        color: var(--infinite-cell-color);
        flex-flow: column;
        background: var(--infinite-background);
      "
    >
      <div style="max-height: 200px; overflow: auto; border: 2px solid magenta">
        Current selection:
        <pre>{{ cellSelectionJSON() }}</pre>
      </div>

      <infinite-data-source
        primaryKey="id"
        [data]="dataSource"
        [(cellSelection)]="cellSelection"
        selectionMode="multi-cell"
      >
        <infinite-table
          debugId="controlled-cell-selection-example"
          [columns]="columns"
          [columnDefaultWidth]="100"
        />
      </infinite-data-source>
    </div>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;

  // #highlight controlled: the selection lives in a signal, two-way bound with [(cellSelection)]
  protected readonly cellSelection =
    signal<DataSourcePropCellSelection_MultiCell>({
      defaultSelection: false,
      selectedCells: [
        [3, 'stack'],
        [0, 'firstName'],
      ],
    });
  // #endhighlight

  protected readonly cellSelectionJSON = computed(() =>
    JSON.stringify(this.cellSelection(), null, 2),
  );
}
