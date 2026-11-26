import { Component, computed } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  injectHeaderCell,
  renderComponent,
} from '@infinite-table/infinite-angular';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-angular';

@Component({
  selector: 'name-sort-icon',
  template: `{{ icon() }}`,
})
class NameSortIcon {
  // #highlight a signal with the same information the renderSortIcon function receives
  private readonly headerCell = injectHeaderCell<Developer>();

  protected readonly icon = computed(() => {
    const { columnSortInfo } = this.headerCell();
    if (!columnSortInfo) {
      return ' 🤷‍♂️';
    }
    return columnSortInfo.dir === 1 ? '▲' : '▼';
  });
}

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id', // will be used as default label in column header
    defaultWidth: 100,
  },
  name: {
    header: 'Name', // custom column header label
    valueGetter: ({ data }) => `${data.firstName} ${data.lastName}`,
    renderSortIcon: () => renderComponent(NameSortIcon),
  },
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const domProps = {
  style: {
    minHeight: 300,
  },
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source primaryKey="id" [data]="dataSource">
      <infinite-table
        debugId="column-sort-icon-example"
        [domProps]="domProps"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = domProps;
}
