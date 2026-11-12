// Snippets shown on group-aggregations.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

{
  //#region aggregation-custom-getter-function
  // useful for retrieving nested values

  getter: (dataItem: Developer) => data.salary.net;
  //#endregion
}

{
  //#region done-function-for-avg-reducer
  done: (acc, data) => acc / data.length;
  //#endregion
}

//#region average-aggregation
import { DataSource, InfiniteTable } from '@infinite-table/infinite-react';

const sum = (a: number, b: number) => a + b;

const reducers = {
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
    aggregationReducers={reducers}
  >
    <InfiniteTable<Developer> {...} />
  </DataSource>
}
//#endregion

{
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
}

{
  //#region datasourcewith-lazyload-enabled
  <DataSource
    lazyLoad // #highlight
    ...
  />
  //#endregion
}

{
  //#region data-function-sending-configurations-to-the
  const data = ({ groupBy, aggregationReducers, sortInfo, groupKeys }) => {
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
    ...
  />
  //#endregion
}

export {};
