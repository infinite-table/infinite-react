// Code shown on the Angular version of the pivoting "Overview" page: the
// sibling of overview.snippet.tsx, with the same `#region` names. The regions
// that are the same code for React and Angular are not repeated here: their
// fences are marked `neutral` in the page. Type-checked, templates included,
// by `npm run tsc:angular`.
import { Component } from '@angular/core';

import {
  DataSource,
  InfiniteTable,
  type DataSourceData,
  type DataSourceDataParams,
  type DataSourcePivotBy,
  type DataSourcePropGroupBy,
  type DataSourcePropPivotBy,
  type DataSourceRemoteData,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  // `team` and `department` are the fields of the `intro` region
  team: string;
  department: string;
  country: string;
  city: string;
  stack: string;
  preferredLanguage: string;
  canDesign: 'yes' | 'no';
  age: number;
  salary: number;
};

type DATA_TYPE = Developer;

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

declare function fetchPivotData(
  params: Pick<
    DataSourceDataParams<Developer>,
    'groupBy' | 'pivotBy' | 'groupKeys' | 'aggregationReducers'
  >,
): Promise<DataSourceRemoteData<Developer>>;

//#region intro
// field needs to be keyof DATA_TYPE both in `pivotBy` and `groupBy`
const pivotBy: DataSourcePropPivotBy<DATA_TYPE> = [{ field: 'team' }];
const groupBy: DataSourcePropGroupBy<DATA_TYPE> = [
  { field: 'department' },
  { field: 'country' },
];

@Component({
  selector: 'pivot-grid',
  imports: [DataSource, InfiniteTable],
  template: `
    <!-- #highlight #ds gives the generated pivot columns, as signals -->
    <infinite-data-source
      #ds="infiniteDataSource"
      primaryKey="id"
      [data]="data"
      [pivotBy]="pivotBy"
      [groupBy]="groupBy"
    >
      <infinite-table
        [columns]="columns"
        [pivotColumns]="ds.pivotColumns()"
        [pivotColumnGroups]="ds.pivotColumnGroups()"
      />
    </infinite-data-source>
    <!-- #endhighlight -->
  `,
})
export class PivotGrid {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly pivotBy = pivotBy;
  protected readonly groupBy = groupBy;
}
//#endregion

@Component({
  selector: 'pivot-snippets',
  imports: [DataSource, InfiniteTable],
  template: `
    <!-- #region pivot-column-default-sortable -->
    <infinite-table
      [columns]="columns"
      [pivotColumn]="{
        defaultSortable: true,
      }"
    />
    <!-- #endregion -->

    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [pivotBy]="pivotByWithColumn"
    />
    <infinite-data-source
      primaryKey="id"
      [lazyLoad]="true"
      [data]="dataSource"
    />
  `,
})
export class PivotSnippets {
  protected readonly data = data;
  protected readonly columns = columns;

  //#region pivot-by-column-object
  // <infinite-data-source primaryKey="id" [data]="data" [pivotBy]="pivotByWithColumn" />
  protected readonly pivotByWithColumn: DataSourcePivotBy<DATA_TYPE>[] = [
    { field: 'country' },
    { field: 'canDesign', column: { defaultWidth: 400 } },
  ];
  //#endregion

  //#region server-side-pivoting-data-function
  // <infinite-data-source primaryKey="id" [lazyLoad]="true" [data]="dataSource" />
  protected readonly dataSource: DataSourceData<Developer> = ({
    groupBy,
    pivotBy,
    groupKeys,
    aggregationReducers,
  }) => {
    // make sure you return a Promise that resolves to the correct structure - see details below

    //eg: groupBy: [{ field: 'country' }, { field: 'stack' }],
    //    groupKeys: [], - so we're requesting top-level data

    //eg: groupBy: [{ field: 'country' }, { field: 'stack' }],
    //    groupKeys: ["Canada"], - so we're requesting Canada's data

    //eg: groupBy: [{ field: 'country' }, { field: 'stack' }],
    //    groupKeys: ["Canada"], - so we're requesting Canada's data

    return fetchPivotData({ groupBy, pivotBy, groupKeys, aggregationReducers });
  };
  //#endregion
}
