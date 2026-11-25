import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  InfiniteTablePropColumnGroups,
  InfiniteTablePropColumnTypes,
  InfiniteTablePropColumns,
  DataSourceData,
} from '@infinite-table/infinite-angular';
import sinon from 'sinon';

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
  salary: {
    field: 'salary',
    type: 'number',
    renderMenuIcon: false,
    columnGroup: 'test',
  },
  age: { field: 'age', columnGroup: 'test' },
  canDesign: { field: 'canDesign', columnGroup: 'test' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city', defaultWidth: 3600 },
  currency: { field: 'currency' },
};

const dataSource: DataSourceData<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const onColumnSizingChange = sinon.spy((_rowHeight: number) => {});

(globalThis as any).onColumnSizingChange = onColumnSizingChange;

const columnGroups: InfiniteTablePropColumnGroups = {
  test: {
    header: 'testing',
  },
};

const columnTypes: InfiniteTablePropColumnTypes<Developer> = {
  default: {
    renderMenuIcon: false,
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '500px',
    width: '1000px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source [data]="dataSource" primaryKey="id">
      <infinite-table
        [domProps]="domProps"
        [columnGroups]="columnGroups"
        [columnTypes]="columnTypes"
        [columnDefaultWidth]="100"
        [columnMinWidth]="50"
        (columnSizingChange)="onColumnSizingChange($event)"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class ResizeGroupsFixedWidthPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly columnGroups = columnGroups;
  protected readonly columnTypes = columnTypes;
  protected readonly domProps = domProps;
  protected readonly onColumnSizingChange = onColumnSizingChange;
}
