import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  DataSourceProps,
  InfiniteTablePropColumns,
  InfiniteTablePropGetCellContextMenuItems,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

const data: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
  },
  salary: {
    defaultFilterable: true,
    field: 'salary',
    type: 'number',
  },

  firstName: {
    field: 'firstName',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency' },
};

const getCellContextMenuItems: InfiniteTablePropGetCellContextMenuItems<
  Developer
> = ({ rowInfo }, { dataSourceApi }) => {
  const rowDisabled = dataSourceApi.isRowDisabledAt(rowInfo.indexInAll);
  return {
    columns: [{ name: 'label' }],
    items: [
      {
        label: 'Disable row',
        disabled: rowDisabled,
        key: 'disable-row',
        onAction: ({ hideMenu }) => {
          dataSourceApi.setRowEnabledAt(rowInfo.indexInAll, false);
          hideMenu();
        },
      },
      {
        label: 'Enable row',
        disabled: !rowDisabled,
        key: 'enable-row',
        onAction: ({ hideMenu }) => {
          dataSourceApi.setRowEnabled(rowInfo.id, true);
          hideMenu();
        },
      },
      {
        label: 'Toggle row enable/disable',
        key: 'toggle-row',
        onAction: ({ hideMenu }) => {
          dataSourceApi.setRowEnabled(
            rowInfo.id,
            dataSourceApi.isRowDisabled(rowInfo.id),
          );
          hideMenu();
        },
      },
    ],
  };
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="data"
      primaryKey="id"
      [(rowDisabledState)]="rowDisabledState"
    >
      <infinite-table
        debugId="rowDisabledState-example"
        [getCellContextMenuItems]="getCellContextMenuItems"
        keyboardNavigation="row"
        [columnDefaultWidth]="120"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly getCellContextMenuItems = getCellContextMenuItems;

  // #highlight controlled: two-way bound, the grid writes the new state back
  protected readonly rowDisabledState = signal<
    DataSourceProps<Developer>['rowDisabledState']
  >({
    enabledRows: true,
    disabledRows: [1, 3, 4, 5],
  });
  // #endhighlight
}
