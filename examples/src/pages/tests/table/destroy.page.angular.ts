import { Component, signal } from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
  injectColumnCellChildren,
  injectInfiniteTable,
} from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

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

let testBrain: any;
function setBrain(brain: any) {
  if (!testBrain) {
    testBrain = brain;
    brain.onDestroy(() => {
      (globalThis as any).brainDestroyed = true;
    });
  }
}

// custom cell used only to grab the brain from the table context,
// like the React page does via useInfiniteTableSelector inside render
@Component({
  selector: 'div[salaryCell]',
  imports: [InfiniteRender],
  template: `<ng-container [infiniteRender]="children()" />`,
})
class SalaryCell {
  protected readonly children = injectColumnCellChildren();

  constructor() {
    const tableContext = injectInfiniteTable<Developer>();
    setBrain(tableContext.getState().brain);
  }
}

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  salary: {
    field: 'salary',
    type: 'number',
    render: ({ value }) => {
      return value;
    },
    components: {
      ColumnCell: SalaryCell,
    },
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
};

const domProps = {
  style: { height: '90vh' },
};

const dataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10-sql`).then(
    (r) => r.json(),
  );
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="destroyed.set(true)">destroy</button>
    @if (!destroyed()) {
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        [columns]="columns"
        [columnDefaultWidth]="220"
        [domProps]="domProps"
      />
    </infinite-data-source>
    }
  `,
})
export default class DestroyPage {
  protected readonly columns = columns;
  protected readonly domProps = domProps;
  protected readonly dataSource = dataSource;

  protected readonly destroyed = signal(false);
}
