import { Component, signal } from '@angular/core';

import {
  DataSource,
  InfiniteCheckBox,
  InfiniteTable,
  GroupRowsState,
  RowSelectionState,
} from '@infinite-table/infinite-angular';
import type { DataSourceData } from '@infinite-table/infinite-angular';

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

const DATA_SOURCE_SIZE = '100';

const dataSource = ({
  pivotBy,
  aggregationReducers,
  groupBy,

  groupKeys = [],
}: any) => {
  const args = [
    pivotBy
      ? 'pivotBy=' +
        JSON.stringify(pivotBy.map((p: any) => ({ field: p.field })))
      : null,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' +
        JSON.stringify(groupBy.map((p: any) => ({ field: p.field })))
      : null,
    aggregationReducers
      ? 'reducers=' +
        JSON.stringify(
          Object.keys(aggregationReducers).map((key) => ({
            field: aggregationReducers[key].field,
            id: key,
            name: aggregationReducers[key].reducer,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/developers${DATA_SOURCE_SIZE}-sql?` +
      args,
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data)
    .then((data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(data);
        }, 2);
      });
    });
};

const columns: Record<string, any> = {
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: {
    field: 'preferredLanguage',
  },
  stack: {
    field: 'stack',
  },
};

const domProps = {
  style: {
    height: '80vh',
  },
};

const groupBy = [
  { field: 'stack' as const },
  {
    field: 'preferredLanguage' as const,
  },
  {
    field: 'canDesign' as const,
  },
];

const groupColumn = {
  field: 'firstName' as const,
};

const groupRowsState = new GroupRowsState({
  expandedRows: true,
  collapsedRows: [],
});

@Component({
  imports: [DataSource, InfiniteTable, InfiniteCheckBox],
  template: `
    <div>
      <input infiniteCheckBox [checked]="null" />test Selected
      {{ selectedCount(rowSelection()) }}
    </div>

    <infinite-data-source
      primaryKey="id"
      [data]="dataSource"
      [groupBy]="groupBy"
      [lazyLoad]="true"
      [defaultGroupRowsState]="groupRowsState"
      selectionMode="multi-row"
      [defaultRowSelection]="rowSelection()"
      [useGroupKeysForMultiRowSelection]="true"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        keyboardNavigation="row"
        groupRenderStrategy="single-column"
        [hideColumnWhenGrouped]="true"
        [groupColumn]="groupColumn"
        [columnDefaultWidth]="300"
      />
    </infinite-data-source>
  `,
})
export default class MultiWithLazyGroupingPage {
  protected readonly dataSource = dataSource as DataSourceData<Developer>;
  protected readonly columns = columns;
  protected readonly groupBy = groupBy;
  protected readonly groupColumn = groupColumn;
  protected readonly groupRowsState = groupRowsState;
  protected readonly domProps = domProps;

  protected readonly rowSelection = signal<any>({
    defaultSelection: false,
    selectedRows: [],
  });

  protected selectedCount(sel: any) {
    return sel instanceof RowSelectionState ? sel.getSelectedCount() : false;
  }
}
