---
title: Aggregations
description: Learn how to define & use aggregations on grouped rows in Infinite Table for React.
---

A natural next step when grouping data is **aggregating the grouped values**. We allow developers to define any number of aggregations and bind them to any column.

The aggregations are defined on the `<DataSource />` component and are easily available at render time. A client-side aggregation needs a reducer function that accumulates the values in the data array and computes the final result.



<Note>

Throughout the docs, we might refer to aggregations as reducers - which, more technically, they are.

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

```tsx title=Aggregation_custom_getter_function
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

  ```tsx title=Done_function_for_avg_reducer
    done: (acc, data) => acc / data.length
  ```


### Putting it all together

Let's take a look at a simple example of aggregating two columns, one to display the avg and the other one should compute the sum of the salary column for grouped rows.

```tsx title=Average_Aggregation
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

```tsx {9} title=Custom_group_row_rendering_for_the_country_column
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

```ts file=aggregations-simple-example.page.tsx

```
</Sandpack>


## Server-Side Aggregations

Examples and docs coming soon. In the meanwhile, see [the grouping page docs on aggregations](grouping-rows#aggregations)