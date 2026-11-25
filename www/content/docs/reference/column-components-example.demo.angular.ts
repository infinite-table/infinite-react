import { Component, computed } from '@angular/core';

import {
  DataSource,
  InfiniteRender,
  InfiniteTable,
  injectColumnCell,
  injectColumnCellChildren,
  injectHeaderCell,
} from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumns,
  InfiniteTablePropColumnTypes,
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

// the host element of the component is the header cell
@Component({
  selector: 'div[defaultHeaderComponent]',
  host: { style: 'border: 1px solid #fefefe' },
  // here you would usually render the default children
  // (`injectHeaderCellChildren()`) and the sort tool, but in this case we
  // want to override the default sort tool as well (which is part of the
  // default children)
  template: `{{ headerCell().column.field }} {{ sortTool() }}`,
})
class DefaultHeaderComponent {
  protected readonly headerCell = injectHeaderCell<Developer>();

  protected readonly sortTool = computed(() => {
    switch (this.headerCell().columnSortInfo?.dir) {
      case undefined:
        return '👉';
      case 1:
        return '👇';
      case -1:
        return '☝🏽';
    }
    return '';
  });
}

// the host element of the component is the cell
@Component({
  selector: 'div[stackComponent]',
  imports: [InfiniteRender],
  host: { '[style]': 'style()' },
  template: `<ng-container [infiniteRender]="children()" />
    <div style="flex: 1"></div>
    {{ emoji() }}`,
})
class StackComponent {
  private readonly cell = injectColumnCell<Developer>();
  // the default content of the cell
  protected readonly children = injectColumnCellChildren();

  private readonly isFrontEnd = computed(
    () => this.cell().value === 'frontend',
  );

  protected readonly emoji = computed(() => (this.isFrontEnd() ? '⚛️' : '💽'));

  protected readonly style = computed(() => ({
    padding: '5px 20px',
    border: `1px solid ${this.isFrontEnd() ? 'red' : 'green'}`,
  }));
}

const columnTypes: InfiniteTablePropColumnTypes<Developer> = {
  default: {
    // override all columns to use these components
    components: {
      HeaderCell: DefaultHeaderComponent,
    },
  },
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  stack: {
    field: 'stack',
    renderValue: ({ data }) => 'Stack: ' + data?.stack,
    components: {
      HeaderCell: DefaultHeaderComponent,
      ColumnCell: StackComponent,
    },
  },
  firstName: {
    field: 'firstName',
  },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="column-components-example"
        [columns]="columns"
        [columnTypes]="columnTypes"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly columnTypes = columnTypes;
}
