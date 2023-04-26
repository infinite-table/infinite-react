---
title: Aggregations
description: Learn how to define & use aggregations on grouped rows in Infinite Table for React.
---

A natural next step when grouping data is **aggregating the grouped values**. We allow developers to define any number of aggregations and bind them to any column.

The aggregations are defined on the `<DataSource />` component and are easily available at render time. A client-side aggregation needs a reducer function that accumulates the values in the data array and computes the final result.

<Note>

Throughout the docs, we might refer to aggregations as reducers - which, more technically, they are, since they reduce an array of values (from a group) to a single value.

</Note>


## Client-Side Aggregations

When using client-side aggregation, each <DataSourcePropLink name="aggregationReducers" code={false}>aggregation</DataSourcePropLink> can have the following:

### An initial value

The `initialValue` is optional value to use as the initial (accumulator) value for the reducer function. You can think of aggregations as an "enhanced" version of [Array.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce), so initial value should sound familiar.

### A reducer function

`reducer` is the function to call for each value in the (grouped) data array. It is called with the following arguments:
  - `accumulator` - the value returned by the previous call to the reducer function, or the `initialValue` if this is the first call. You return the new accumulator value from this function.
  - `value` - the value of the current item in the data array. If the aggregation has a `field`, this is the value of that field in the current item. Otherwise, value is the result of calling the `reducer.getter(data)` function (if one exists) or null if no getter is defined.
  - `dataItem` - the current item in the data array.
  - `index` - the index of the current item in the data array.

### A `field` property or a `getter` function

For simple use-cases of client-side aggregations, a `field` is the way to go. This defines the field property (from the DATA_TYPE) to which the aggregation is bound.

For more complex scenarios, the aggregation should have a `getter` function. If both a `field` and a `getter` are provided, the `getter` has higher priority and will be used.

Use this `getter` function to compute the value the current item in the array brings to the aggregation.

```tsx title="Aggregation_custom_getter_function"
// useful for retrieving nested values

getter: (dataItem: Developer) => data.salary.net
```

<Hint>

For using nested values inside aggregations, use the aggregation `getter` function.

</Hint>

### A completion `done` function

The completion `done` function is optional - if specified, will be after iterating over all the values in the grouped data array. Can be used to change the final result of the aggregation. It is called with the following arguments:
  - `accumulator` - the value returned by the last call to the reducer function
  - `data` - the grouped data array.
  This is useful for computing averages, for example:

```tsx title="Done function for avg reducer"
  done: (acc, data) => acc / data.length
```


### Putting it all together

Let's take a look at a simple example of aggregating two columns, one to display the avg and the other one should compute the sum of the salary column for grouped rows.

```tsx title="Average Aggregation"
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
```


In the above example, note that aggregations are an object where the keys of the object are used to identify the aggregation and the values are the aggregation configuration objects, as described above.

<Hint>

At run-time, you have access to the aggregation reducer results inside group rows - you can use the `rowInfo.reducerResults` object to access those values. For the example above, you change how group rows are rendered for a certain column and display the aggregation results in a custom way:

```tsx {9} title="Custom_group_row_rendering_for_the_country_column"

country: {
  field: 'country',

  // define a custom renderGroupValue fn for the country column

  renderGroupValue: ({ rowInfo }) => {
    const { reducerResults = {} } = rowInfo;
    // note the keys in the reducerResults objects match the keys in the aggregationReducers object
    return `Avg age: ${reducerResults.avg}, total salary ${reducerResults.sumAgg}`;
  },
},
```

</Hint>

<Sandpack title="Sum and average aggregation example">

```ts file="aggregations-simple-example.page.tsx"

```
</Sandpack>


## Server-Side Aggregations

Server-side aggregations are defined in the same way as client-side aggregations (except the `reducer` function is missing), but the aggregation values are computed by the server and returned as part of the data response.

For computing the grouping and aggregations on the server, the backend needs to know the grouping and aggregation configuration. As such, Infinite Table will call the <DPropLink name="data" code={false}>DataSource data</DPropLink> function with an object that contains all the required info:

 - `groupBy` - the array of grouping fields, as passed to the `<DataSource />` component.
- `pivotBy` - the array of pivot fields, as passed to the `<DataSource />` component.
 - `aggregationReducers` - the value of the <DPropLink name="aggregationReducers" /> prop, as configured on the `<DataSource />` component.
 - `sortInfo` - the current <DPropLink name="sortInfo" code={false}>sorting information</DPropLink> for the data.

For the lazy-loading use-case, there are other useful properties you can use from the object passed into the `data` function:

 - `groupKeys: string[]` - the group keys for the current group - the `data` fn is generally called lazily when the user expands a group row. This info is useful for fetching the data for a specific group.
- `lazyLoadStartIndex` - provided when batching is also enabled via the <DPropLink name="lazyLoad" /> prop. This is the index of the first item in the current batch.
- `lazyLoadBatchSize` - also used when batching is enabled. This is the number of items in the current batch.

Besides the above information, if filtering is used, a `fiterValue` is also made available.

In order to showcase the server-side aggregations, let's build an example similar to the above one, but let's lazily load group data. 

```tsx {2} title="DataSourcewith lazyLoad enabled"
<DataSource
  lazyLoad
  ...
/>
```

As soon a grouping and aggregations are no longer computed on the client, your `data` function needs to send those configurations on the backend, so it needs to get a bit more complicated:

```tsx title="Data_function_sending_configurations_to_the_backend"
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
```

When fetching without grouping (or with local grouping and aggregations), the `<DataSource />` component expects a flat array of data items coming from the server.

However, when the grouping is happening server-side, the `<DataSource />` component expects a response that has the following shape: 

 * `data` - the root array with grouping and aggregation info. Each item in the array should have the following:
    - `keys` - an array of the keys for the current group - eg `['USA']` or `['USA', 'New York']`
    - `data` - an object with all the common values for the group - eg `{ country: 'USA' }` or `{ country: 'USA', city: 'New York' }`
    - `aggregations` - an object with the aggregation values for the group - eg `{ age: 30, salary: 120300 }`. The keys in this object should match the keys in the <DPropLink name="aggregationReducers" /> object.
    - `pivot` - pivoting information for the current group - more on that on the dedicated [Pivoting page](./pivoting/overview).

When the user is expanding the last level, in order to see the leaf rows, the shape of the response is expected to be the same as when there is no grouping - namely an array of data items or an object where the `data` property is an array of data items.

Let's put all of this into a working example.

<Sandpack>

<Description>

This showcases grouping and aggregations on the server - both the `age` and `salary` columns have an AVG aggregation defined.

Grouping is done by the `country`, `city` and `stack` columns.

</Description>

```tsx file="grouping-and-aggregations-with-lazy-load-example.page.tsx"
```

</Sandpack>

<Note>

When the user is doing a sort on the table, the `<DataSource />` is fetched from scratch, but the expanded/collapsed state is preserved, and all the required groups that need to be re-fetched are reloaded as needed (if they are not eagerly included in the served data).

</Note>

