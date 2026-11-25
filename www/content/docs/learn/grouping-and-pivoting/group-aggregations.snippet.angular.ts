// Code shown on the Angular version of the "Aggregations" page: the sibling of
// group-aggregations.snippet.tsx, with the same `#region` names. Type-checked,
// templates included, by `npm run tsc:angular`.
//
// The regions that are the same code in React and Angular are shown from the
// .tsx file (the fences marked `neutral` in the page).
import type {
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  stack: string;
  age: number;
  salary: number;
};

declare const developers: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;
declare const BASE_URL: string;

//#region average-aggregation
import { Component } from '@angular/core';
import {
  DataSource,
  InfiniteTable,
  type DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-angular';

const sum = (a: number, b: number) => a + b;

const reducers: DataSourcePropAggregationReducers<Developer> = {
  avg: {
    initialValue: 0,
    field: 'age',
    reducer: sum,
    done: (acc, data) => Math.round(acc / data.length),
  },

  sumAgg: {
    initialValue: 0,
    field: 'salary',
    reducer: sum,
  },
};

@Component({
  selector: 'developers-grid',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      primaryKey="id"
      [data]="data"
      [aggregationReducers]="reducers"
    >
      <infinite-table [columns]="columns" />
    </infinite-data-source>
  `,
})
export class DevelopersGrid {
  protected readonly data = developers;
  protected readonly columns = columns;
  protected readonly reducers = reducers;
}
//#endregion

@Component({
  selector: 'lazy-load-snippets',
  imports: [DataSource],
  template: `
    <!-- #region datasourcewith-lazyload-enabled -->
    <infinite-data-source [lazyLoad]="true" primaryKey="id" [data]="data" /> <!-- #highlight -->
    <!-- #endregion -->

    <infinite-data-source
      [data]="lazyLoadData"
      [lazyLoad]="true"
      primaryKey="id"
    />
  `,
})
export class LazyLoadSnippets {
  protected readonly data: DataSourceData<Developer> = () =>
    fetch(BASE_URL + '/developers10k-sql').then((r) => r.json());

  //#region data-function-sending-configurations-to-the
  // <infinite-data-source [data]="lazyLoadData" [lazyLoad]="true" primaryKey="id" />
  protected readonly lazyLoadData: DataSourceData<Developer> = ({
    groupBy,
    aggregationReducers,
    sortInfo,
    groupKeys,
  }) => {
    // it's important to send the current group keys - for top level, this will be []
    const args: string[] = [`groupKeys=${JSON.stringify(groupKeys)}`];

    // turn the sorting info into an array
    if (sortInfo && !Array.isArray(sortInfo)) {
      sortInfo = [sortInfo];
    }

    if (sortInfo) {
      // the backend expects the sort info to be an array of field,dir pairs
      args.push(
        'sortInfo=' +
          JSON.stringify(
            sortInfo.map((s) => ({
              field: s.field,
              dir: s.dir,
            })),
          ),
      );
    }

    if (groupBy) {
      // for grouping, send an array of objects with the `field` property
      args.push(
        'groupBy=' + JSON.stringify(groupBy.map((p) => ({ field: p.field }))),
      );
    }

    if (aggregationReducers) {
      args.push(
        'reducers=' +
          JSON.stringify(
            // by convention, we send an array of reducers, each with `field` `name`(= "avg") and `id`
            // it's up to you to decide what the backend needs
            Object.keys(aggregationReducers).map((key) => ({
              field: aggregationReducers[key].field,
              id: key,
              name: aggregationReducers[key].reducer,
            })),
          ),
      );
    }

    const url = BASE_URL + `/developers10k-sql?` + args.join('&');
    return fetch(url).then((r) => r.json());
  };
  //#endregion
}
