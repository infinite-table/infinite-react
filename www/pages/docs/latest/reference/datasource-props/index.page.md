---
title: DataSource Props
layout: API
---

In the API Reference below we'll use **`DATA_TYPE`** to refer to the TypeScript type that represents the data the component is bound to.

<PropTable>

<Prop name="aggregationReducers" type="Record<string, DataSourceAggregationReducer>">

> Specifies the functions to use for aggregating data. The object is a map where the keys are ids for aggregations and values are object of the shape described below.

The `DataSourceAggregationReducer` type can have the following properties
* `initialValue` - type `any`, mandatory for client-side aggregations
* `field` - the field to aggregate on. Optional - if not specified, make sure you specify `getter`
* `getter`: `(data:T)=> any` - a getter function, called with the current `data` object.
* `reducer`:  `string | (accumulator, value, data: T) => any` - either a string (for server-side aggregations) or a mandatory aggregation function for client-side aggregations.
* `done`: `(accumulator, arr: T[]) => any` - a function that is called to finish the aggregation after all values have been accumulated. The function should return the final value of the aggregation. Only used for client-side aggregations.
* `name` - useful especially in combination with <DataSourcePropLink name="pivotBy" />, as it will be used as the pivot column header.
* `pivotColumn` - if specified, will configure the pivot column generated for this aggregation. This object has the same shape as a normal <PropLink name="columns">column</PropLink>, but supports an extra `inheritFromColumn` property, which can either be a `string` (a column id), or a `boolean`. The default behavior for a pivot column is to inherit the configuration of the initial column that has the same `field` property. `inheritFromColumn` allows you to specify another column to inherit from, or, if `false` is passed, the pivot column will not inherit from any other column.


<Sandpack title="Aggregation demo - see `salary` column">

```ts file=groupBy-example.page.tsx
```
```ts file=columns.ts
```
</Sandpack> 

Aggregation reducers can be used in combination with grouping and pivoting. The example below shows aggregations used with server-side pivoting

<Sandpack title="Aggregations used together with server-side pivoting"> 

```ts file=../../learn/grouping-and-pivoting/pivoting/remote-pivoting-example.page.tsx
```

</Sandpack>

Pivot columns generated for aggregations will inehrit from initial columns - the example shows how to leverage this behavior and how to extend it

<Sandpack title="Pivot columns inherit from original columns bound to the same field"> 

```ts file=../../learn/grouping-and-pivoting/pivoting/pivot-column-inherit-example.page.tsx
```

</Sandpack>

</Prop>

<Prop name="data" type="DATA_TYPE[]|Promise<DATA_TYPE[]|() => DATA_TYPE[]|Promise<DATA_TYPE[]>">

> Specifies the data the component is bound to. Can be one of the following:
 * an array of the bound type - eg: `Employee[]`
 * a Promise tha resolves to an array like the above
 * a function that returns an any of the above


<Sandpack title="Data loading example with promise">

```ts file=data-example.page.tsx
```
</Sandpack> 


<Note>

It's important to note you can re-fetch data by changing the reference you pass as the `data` prop to the `<DataSource/>` component. Passing another `data` function, will cause the component to re-execute the function and thus load new data.

</Note>

<Sandpack title="Re-fetching data"> 

```ts file=../../learn/working-with-data/refetch-example.page.tsx
```
```ts file=../../learn/working-with-data/columns.ts as=columns.ts
```

</Sandpack>

</Prop>

<Prop name="lazyLoad" type="boolean|{batchSize:number}" defaultValue={false}>

> Whether the datasource will load data lazily - useful for server-side grouping and pivoting. If set to `true` or to an object (with `batchSize` property), the <DataSourcePropLink name="data" /> prop must be a function that returns a promise.

<Sandpack title="Server-side pivoting with full lazy load"> 

```ts file=../../learn/grouping-and-pivoting/pivoting/remote-pivoting-example.page.tsx
```

</Sandpack>

</Prop>

<Prop name="groupBy">

> An array of objects with `field` properties, that control how rows are being grouped.

Each item in the array can have the following properties:
 * field - `keyof DATA_TYPE`
 * column - config object for the group <PropLink name="column">column</PropLink>.

<Sandpack>

```ts file=groupBy-example.page.tsx
```
```ts file=columns.ts
```
</Sandpack>

</Prop>

<Prop name="livePagination" type="boolean">

> Whether the component should use live pagination.

Use this in combination with <DataSourcePropLink name="livePaginationCursor" /> and <DataSourcePropLink name="onDataParamsChange" />

<Sandpack  title="Live pagination - with react-query" deps="react-query">

```ts file=../../learn/working-with-data/live-pagination-example.page.tsx
```
</Sandpack>

</Prop>

<Prop name="livePaginationCursor" type="string|number|((params) =>string|number)" defaulValue={undefined}>

> A cursor value for live pagination. A good value for this is the id of the last item in the <DataSourcePropLink name="data" /> array. It can also be defined as a function

Use this in combination with <DataSourcePropLink name="livePagination" /> and <DataSourcePropLink name="onDataParamsChange" />

<Note>

When this is a function, it is called with a parameter object that has the following properties:

 - `array` - the current array of data
 - `lastItem` - the last item in the array
 - `length` - the length of the data array

</Note>

<Sandpack  title="Live pagination - with react-query" deps="react-query">

```ts file=../../learn/working-with-data/live-pagination-example.page.tsx
```
</Sandpack>

</Prop>


<Prop name="onDataParamsChange" type="(dataParams: DataSourceDataParams<DATA_TYPE:>)=>void">

> A function to be called when data-related props/state change.

Can be used to implement <DataSourcePropLink name="livePagination" />

The function is called with an object that has the following properties:

 - `sortInfo` - current sort information - see <DataSourcePropLink name="sortInfo" /> for details
 - `groupBy` - current grouping information - see <DataSourcePropLink name="groupBy" /> for details
 - `livePaginationCursor` - the value for the live pagination cursor - see <DataSourcePropLink name="livePaginationCursor" /> for details
 - `changes` - an object that can help you figure out what change caused `onDataParamsChange` to be called.

<Sandpack  title="Live pagination - with react-query" deps="react-query">

```ts file=../../learn/working-with-data/live-pagination-example.page.tsx
```
</Sandpack>
</Prop>

<Prop name="onLivePaginationCursorChange" type="(cursor)=> void">

> A function to be called when the <DataSourcePropLink name="livePaginationCursor" /> changes.

Also see related <DataSourcePropLink name="onDataParamsChange" />.

</Prop>

</PropTable> 

