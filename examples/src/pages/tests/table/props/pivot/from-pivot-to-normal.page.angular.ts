import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { columns } from './from-pivot-to-normal-data';
import { data } from './pivot-grouping-example-data';

const dataSource = () => {
  return Promise.resolve(data);
};

const domProps = {
  style: {
    height: '80vh',
  },
};

type Config = {
  groupBy?: any[];
  pivotBy?: any[];
  agg?: Record<string, any>;
};
const noPivotConfig: Config = {};
const pivotConfig: Config = {
  ...noPivotConfig,
  groupBy: [
    {
      field: 'license',
    },
    { field: 'language' },
  ],
  pivotBy: [{ field: 'language' }],
  agg: {
    stargazers_count: {
      initialValue: 0,
      field: 'stargazers_count',
      reducer: (acc: number, row: number) => acc + row,
    },
    license_count: {
      initialValue: 0,
      field: 'license',
      reducer: (acc: number) => acc + 1,
    },
  },
};

const wrapperStyle = {
  display: 'flex',
  flex: 1,
  color: 'var(--infinite-cell-color)',
  flexFlow: 'column',
  background: 'var(--infinite-background)',
};

const emptyColumns: Record<string, any> = {};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <div [style]="wrapperStyle">
      <div style="padding: 10px">
        <button
          [disabled]="config() === noPivotConfig"
          (click)="config.set(noPivotConfig)"
        >
          Switch to no pivot
        </button>

        <button
          [disabled]="config() === pivotConfig"
          (click)="config.set(pivotConfig)"
        >
          Switch to Pivot
        </button>
      </div>
      <infinite-data-source
        #ds="infiniteDataSource"
        primaryKey="id"
        [data]="dataSource"
        [groupBy]="groupRowsBy()"
        [aggregationReducers]="agg()"
        [pivotBy]="pivotBy()"
      >
        @if (ds.pivotColumns()) {
          <infinite-table
            [domProps]="domProps"
            [columns]="emptyColumns"
            [pivotColumns]="ds.pivotColumns()"
            [pivotColumnGroups]="ds.pivotColumnGroups()"
            [columnDefaultWidth]="100"
            pivotTotalColumnPosition="end"
          />
        } @else {
          <infinite-table
            [domProps]="domProps"
            [columns]="columns"
            [columnDefaultWidth]="100"
          />
        }
      </infinite-data-source>
    </div>
  `,
})
export default class FromPivotToNormalPage {
  protected readonly dataSource = dataSource;
  protected readonly domProps = domProps;
  protected readonly columns = columns;
  protected readonly emptyColumns = emptyColumns;
  protected readonly wrapperStyle = wrapperStyle;
  protected readonly noPivotConfig = noPivotConfig;
  protected readonly pivotConfig = pivotConfig;

  protected readonly config = signal<Config>(pivotConfig);

  protected readonly groupRowsBy = computed(() => this.config().groupBy || []);
  protected readonly pivotBy = computed(() => this.config().pivotBy);
  protected readonly agg = computed(() => this.config().agg);
}
