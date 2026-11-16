// Code shown on the "Group Aggregations" page, one `#region` per snippet.
// Type-checked with the rest of the docs against the current source.
import * as React from 'react';
import type {
  DataSourceAggregationReducer,
  DataSourceData,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  stack: string;
  age: number;
  salary: number;
};

declare const data: Developer[];
declare const BASE_URL: string;

export function nestedValueGetter() {
  // here the salary is a nested object
  type Developer = {
    id: number;
    salary: { net: number; gross: number };
  };

  const netSalary: DataSourceAggregationReducer<Developer, number> = {
    initialValue: 0,
    reducer: (acc: number, value: number) => acc + value,
    //#region aggregation-custom-getter-function
    // useful for retrieving nested values

    getter: (dataItem: Developer) => dataItem.salary.net,
    //#endregion
  };

  return netSalary;
}

export const avgAge: DataSourceAggregationReducer<Developer, number> = {
  initialValue: 0,
  field: 'age',
  reducer: (acc: number, value: number) => acc + value,
  //#region done-function-for-avg-reducer
  done: (acc, data) => acc / data.length,
  //#endregion
};

//#region average-aggregation
import {
  DataSource,
  InfiniteTable,
  type DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-react';

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
    reducer: sum
  }
}

function App() {
  return <DataSource<Developer>
    primaryKey="id"
    data={data}
    aggregationReducers={reducers}
  >
    <InfiniteTable<Developer> columns={columns} />
  </DataSource>
}
//#endregion

const columns: InfiniteTablePropColumns<Developer> = {
  //#region custom-group-row-rendering-for-the-country

  country: {
    field: 'country',

    // define a custom renderGroupValue fn for the country column

    renderGroupValue: ({ rowInfo }) => {
      const { reducerResults = {} } = rowInfo;
      // note the keys in the reducerResults objects match the keys in the aggregationReducers object // #highlight
      return `Avg age: ${reducerResults.avg}, total salary ${reducerResults.sumAgg}`;
    },
  },
  //#endregion
};

// `otherProps` stands for the rest of the `<DataSource />` props
export function LazyLoadEnabled(otherProps: {
  primaryKey: keyof Developer;
  data: DataSourceData<Developer>;
}) {
  return (
    //#region datasourcewith-lazyload-enabled
    <DataSource
      lazyLoad // #highlight
      {...otherProps}
    />
    //#endregion
  );
}

export function LazyLoadDataFunction(otherProps: { primaryKey: keyof Developer }) {
  //#region data-function-sending-configurations-to-the
  const data: DataSourceData<Developer> = ({ groupBy, aggregationReducers, sortInfo, groupKeys }) => {
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
    return fetch(url).then(r=>r.json())
  }

  <DataSource
    data={data}
    lazyLoad
    {...otherProps}
  />
  //#endregion
  return null;
}

export { App };
