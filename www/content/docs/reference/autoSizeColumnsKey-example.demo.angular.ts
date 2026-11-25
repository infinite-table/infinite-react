import { Component, computed, signal } from '@angular/core';

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
  id: { field: 'id' },
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
        color: var(--infinite-cell-color);
        background: var(--infinite-background);
      "
    >
      <label>
        <input
          type="checkbox"
          [checked]="includeHeader()"
          (change)="includeHeader.set($any($event.target).checked)"
        />
        Include header
      </label>

      <button
        style="
          margin: 10px;
          padding: 10px;
          border-radius: 5px;
          border: 2px solid magenta;
        "
        (click)="key.set(key() + 1)"
      >
        Click to auto-size
      </button>
    </div>

    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="autoSizeColumnsKey-example"
        [autoSizeColumnsKey]="autoSizeColumnsKey()"
        [columns]="columns"
        [columnDefaultWidth]="200"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;

  protected readonly key = signal(0);
  protected readonly includeHeader = signal(false);

  // #highlight a new key auto-sizes the columns
  protected readonly autoSizeColumnsKey = computed(() => ({
    includeHeader: this.includeHeader(),
    key: this.key(),
  }));
  // #endhighlight
}
