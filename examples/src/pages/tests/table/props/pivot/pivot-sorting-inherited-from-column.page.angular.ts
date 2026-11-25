import { Component } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';
import type {
  DataSourcePropAggregationReducers,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  DataSourceGroupBy,
  DataSourcePivotBy,
} from '@infinite-table/infinite-angular';

import { data } from './pivot-sorting-example-data';
import type { WebFramework } from './pivot-sorting-example-data';

const columns: InfiniteTablePropColumns<WebFramework> = {
  id: { field: 'id' },
  name: { field: 'name' },
  lang: { field: 'language' },
  license: { field: 'license', defaultSortable: false },
  stargazers: {
    field: 'stargazers_count',
    type: 'number',
    defaultSortable: true,
  },
};

const countReducer: InfiniteTableColumnAggregator<WebFramework, any> = {
  initialValue: 0,
  reducer: (acc) => acc + 1,
};

const sumReducer: InfiniteTableColumnAggregator<WebFramework, any> = {
  initialValue: 0,
  reducer: (acc, value) => acc + value,
};

const reducers: DataSourcePropAggregationReducers<WebFramework> = {
  stargazers_count: {
    ...sumReducer,
    name: 'Stargarzers (sum)',
    field: 'stargazers_count',
    pivotColumn: {
      inheritFromColumn: true,
    },
  },
  license: {
    ...countReducer,
    name: 'License (count)',
    field: 'license',
  },
};
const groupBy: DataSourceGroupBy<WebFramework>[] = [
  { field: 'language' },
  { field: 'license' },
];
const pivotBy: DataSourcePivotBy<WebFramework>[] = [
  {
    field: 'has_wiki',
    // column: {
    //   defaultSortable: true,
    // },
  },
];

const defaultSortInfo: any[] = [
  // { id: 'stargazers_count:true', dir: 1 },
  // { id: 'group-by-license', dir: -1 },
];

const domProps = {
  style: {
    height: '80vh',
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      #ds="infiniteDataSource"
      primaryKey="id"
      [data]="data"
      [groupBy]="groupBy"
      [pivotBy]="pivotBy"
      [aggregationReducers]="reducers"
      [defaultSortInfo]="defaultSortInfo"
    >
      <infinite-table
        [domProps]="domProps"
        [columns]="columns"
        [hideEmptyGroupColumns]="true"
        groupRenderStrategy="multi-column"
        [pivotColumns]="ds.pivotColumns()"
        [pivotColumnGroups]="ds.pivotColumnGroups()"
      />
    </infinite-data-source>
  `,
})
export default class PivotSortingInheritedFromColumnPage {
  protected readonly columns = columns;
  protected readonly reducers = reducers;
  protected readonly groupBy = groupBy;
  protected readonly pivotBy = pivotBy;
  protected readonly defaultSortInfo = defaultSortInfo;
  protected readonly domProps = domProps;
  protected readonly data = data;
}
