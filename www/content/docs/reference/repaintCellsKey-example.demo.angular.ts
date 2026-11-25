import { Component, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourceApi,
  DataSourceSingleSortInfo,
  InfiniteTablePropColumns,
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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

// NOTE: scanning all the rows for every cell, on every data change, is NOT
// a performant way to compute averages or other aggregations - it's done
// here only to keep the demo short. In a real app, compute the aggregations
// once per data change (eg. a memoized map keyed by country) and have both
// `repaintCellsKey` and `render` read from it.
function averageSalaryFor(rows: Developer[], country: string) {
  const countryRows = rows.filter((row) => row.country === country);
  const sum = countryRows.reduce((total, row) => total + row.salary, 0);
  return countryRows.length ? Math.round(sum / countryRows.length) : 0;
}

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName' },
  country: { field: 'country' },
  salary: {
    field: 'salary',
    type: 'number',
    defaultEditable: true,
    header: 'Salary (editable)',
  },
  stale: {
    header: 'Country avg - no repaintCellsKey',
    type: 'number',
    defaultWidth: 260,
    // depends on OTHER rows - goes stale when another row
    // in the same country is edited
    render: ({ rowInfo, dataSourceApi }) => {
      if (rowInfo.isGroupRow) {
        return null;
      }
      return averageSalaryFor(
        dataSourceApi.getOriginalDataArray(),
        rowInfo.data.country,
      );
    },
  },
  fresh: {
    header: 'Country avg - with repaintCellsKey',
    type: 'number',
    defaultWidth: 260,
    // the derived value is the key, so cells re-render
    // only when their country average actually changes
    repaintCellsKey: ({ rowInfo, dataSourceState }) => {
      if (rowInfo.isGroupRow) {
        return null;
      }
      return averageSalaryFor(
        dataSourceState.originalDataArray,
        rowInfo.data.country,
      );
    },
    render: ({ rowInfo, dataSourceApi }) => {
      if (rowInfo.isGroupRow) {
        return null;
      }
      return averageSalaryFor(
        dataSourceApi.getOriginalDataArray(),
        rowInfo.data.country,
      );
    },
  },
};

const defaultSortInfo: DataSourceSingleSortInfo<Developer> = {
  field: 'country',
  dir: 1,
};

const domProps = { style: { height: 400 } };

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <div style="display: flex; gap: 10px; padding: 10px">
      <button (click)="updateFirstRowSalary()">
        Update salary of first row
      </button>
      <button (click)="repaintCellsKey.set(repaintCellsKey() + 1)">
        Repaint all cells
      </button>
    </div>
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      (ready)="dataSourceApi = $event"
      [defaultSortInfo]="defaultSortInfo"
    >
      <infinite-table
        [columns]="columns"
        [columnDefaultWidth]="150"
        [repaintCellsKey]="repaintCellsKey()"
        [domProps]="domProps"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly defaultSortInfo = defaultSortInfo;
  protected readonly domProps = domProps;

  protected dataSourceApi: DataSourceApi<Developer> | null = null;
  protected readonly repaintCellsKey = signal(0);

  protected updateFirstRowSalary() {
    const firstRow = this.dataSourceApi?.getDataByIndex(0);
    if (firstRow) {
      this.dataSourceApi?.updateData({
        id: firstRow.id,
        salary: Math.round(Math.random() * 200_000),
      });
    }
  }
}
