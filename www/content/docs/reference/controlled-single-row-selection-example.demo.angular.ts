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
    <p style="color: var(--infinite-cell-color); padding: 10px">
      Current row selection:
      <code style="display: inline-block">
        <pre> {{ rowSelectionJSON() }}.</pre>
      </code>
    </p>

    <infinite-data-source
      [data]="dataSource"
      [(rowSelection)]="rowSelection"
      primaryKey="id"
    >
      <infinite-table
        debugId="controlled-single-row-selection-example"
        [columns]="columns"
        [columnDefaultWidth]="150"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;

  // #highlight controlled: two-way bound, the grid writes the selected row back
  protected readonly rowSelection = signal<number | string | null>(3);

  protected readonly rowSelectionJSON = computed(() =>
    JSON.stringify(this.rowSelection()),
  );
}
