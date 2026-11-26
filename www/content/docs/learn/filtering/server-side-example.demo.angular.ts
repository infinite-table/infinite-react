import { Component } from '@angular/core';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-angular';
import type {
  DataSourceData,
  DataSourcePropFilterValue,
  DataSourcePropSortInfo,
  InfiniteTablePropColumns,
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

const data: DataSourceData<Developer> = ({ filterValue, sortInfo }) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }
  const args = [
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,

    filterValue
      ? 'filterBy=' +
        JSON.stringify(
          filterValue.map(({ field, filter }) => {
            return {
              field: field,
              operator: filter.operator,
              value:
                filter.type === 'number' ? Number(filter.value) : filter.value,
            };
          }),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');

  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?` + args)
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
    field: 'salary',
    type: 'number',
  },

  firstName: {
    field: 'firstName',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency' },
};

const domProps = {
  style: {
    height: '100%',
  },
};
const defaultSortInfo: DataSourcePropSortInfo<Developer> = [
  {
    field: 'stack',
    dir: 1,
  },
  {
    field: 'salary',
    dir: 1,
  },
];

const defaultFilterValue: DataSourcePropFilterValue<Developer> = [];

const shouldReloadData = {
  sortInfo: true,
  filterValue: true,
};

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="data"
      primaryKey="id"
      [defaultFilterValue]="defaultFilterValue"
      [defaultSortInfo]="defaultSortInfo"
      [shouldReloadData]="shouldReloadData"
    >
      <infinite-table
        debugId="server-side-example"
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly defaultFilterValue = defaultFilterValue;
  protected readonly defaultSortInfo = defaultSortInfo;
  protected readonly shouldReloadData = shouldReloadData;
  protected readonly domProps = domProps;
  protected readonly columns = columns;
}
