---
title: DataSource Props
layout: API
---

In the API Reference below we'll use **`DATA_TYPE`** to refer to the TypeScript type that represents the data the component is bound to.

<PropTable>

<Prop name="aggregationReducers" type="Record<string, DataSourceAggregationReducer>">

> Specifies the functions to use for aggregating data. The object is a map where the keys are ids for aggregations and values are object of the shape described below.

The `DataSourceAggregationReducer` type can have the following properties
* `initialValue` - type `any`, mandatory
* `field` - the field to aggregate on. Optional - if not specified, make sure you specify `getter`
* `getter`: `(data:T)=> any` - a getter function, called with the current `data` object()
* `reducer`:  `(accumulator, value, data) => any`
* `done`: `(accumulator, arr) => any`


<Sandpack title="Aggregation demo - see `salary` column">

```ts file=groupBy-example.page.tsx
```
```ts file=columns.ts
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

<Prop name="livePaginationCursor" type="string|number" defaulValue={undefined}>

> A cursor value for live pagination. A good value for this is the id of the last item in the <DataSourcePropLink name="data" /> array.

Use this in combination with <DataSourcePropLink name="livePagination" /> and <DataSourcePropLink name="onDataParamsChange" />

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

<Sandpack  title="Live pagination - with react-query" deps="react-query">

```ts file=../../learn/working-with-data/live-pagination-example.page.tsx
```
</Sandpack>
</Prop>

<Prop name="onLivePaginationCursorChange" type="(cursor)=> void">

> A function to be called when the <Prop name="livePaginationCursor" /> changes.

Also see related <PropLink name="onDataParamsChange" />.

</PropLink>

</PropTable> 

