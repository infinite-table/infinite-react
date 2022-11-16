---
title: DataSource Props
layout: API
---

In the API Reference below we'll use **`DATA_TYPE`** to refer to the TypeScript type that represents the data the component is bound to.

<PropTable>

<Prop name="aggregationReducers" type="Record<string, DataSourceAggregationReducer>">

> Specifies the functions to use for aggregating data. The object is a map where the keys are ids for aggregations and values are object of the shape described below.

The `DataSourceAggregationReducer` type can have the following properties

- `initialValue` - type `any`, mandatory for client-side aggregations
- `field` - the field to aggregate on. Optional - if not specified, make sure you specify `getter`
- `getter`: `(data:T)=> any` - a getter function, called with the current `data` object.
- `reducer`: `string | (accumulator, value, data: T) => any` - either a string (for server-side aggregations) or a mandatory aggregation function for client-side aggregations.
- `done`: `(accumulator, arr: T[]) => any` - a function that is called to finish the aggregation after all values have been accumulated. The function should return the final value of the aggregation. Only used for client-side aggregations.
- `name` - useful especially in combination with <DataSourcePropLink name="pivotBy" />, as it will be used as the pivot column header.
- `pivotColumn` - if specified, will configure the pivot column generated for this aggregation. This object has the same shape as a normal <PropLink name="columns">column</PropLink>, but supports an extra `inheritFromColumn` property, which can either be a `string` (a column id), or a `boolean`. The default behavior for a pivot column is to inherit the configuration of the initial column that has the same `field` property. `inheritFromColumn` allows you to specify another column to inherit from, or, if `false` is passed, the pivot column will not inherit from any other column.

<Sandpack title="Aggregation demo - see `salary` column">

```ts file=groupBy-example.page.tsx

```

```ts file=columns.ts

```

</Sandpack>

Aggregation reducers can be used in combination with grouping and pivoting. The example below shows aggregations used with server-side pivoting

<Sandpack title="Aggregations used together with server-side pivoting">

```ts file=$DOCS/learn/grouping-and-pivoting/pivoting/remote-pivoting-example.page.tsx

```

</Sandpack>

Pivot columns generated for aggregations will inehrit from initial columns - the example shows how to leverage this behavior and how to extend it

<Sandpack title="Pivot columns inherit from original columns bound to the same field">

```ts file=$DOCS/learn/grouping-and-pivoting/pivoting/pivot-column-inherit-example.page.tsx

```

</Sandpack>

</Prop>

<Prop name="data" type="DATA_TYPE[]|Promise<DATA_TYPE[]|() => DATA_TYPE[]|Promise<DATA_TYPE[]>">

> Specifies the data the component is bound to. Can be one of the following:

- an array of the bound type - eg: `Employee[]`
- a Promise tha resolves to an array like the above
- a function that returns an any of the above

<Sandpack title="Data loading example with promise">

```ts file=data-example.page.tsx

```

</Sandpack>

<Note>

It's important to note you can re-fetch data by changing the reference you pass as the `data` prop to the `<DataSource/>` component. Passing another `data` function, will cause the component to re-execute the function and thus load new data.

</Note>

<Sandpack title="Re-fetching data">

```ts file=$DOCS/learn/working-with-data/refetch-example.page.tsx

```

```ts file=$DOCS/learn/working-with-data/columns.ts as=columns.ts

```

</Sandpack>

</Prop>

<Prop name="defaultRowSelection" type="string|number|null|object">

> Describes the selected row(s) in the `DataSource`

See more docs in the controlled version of this prop, <PropLink name="rowSelection" />

For single selection, the prop will be of type: `number | string | null`. Use `null` for empty selection in single selection mode.

For multiple selection, the prop will have the following shape:

```ts
const rowSelection = {
  selectedRows: [3, 6, 100, 23], // those specific rows are selected
  defaultSelection: false, // all rows deselected by default
};

// or
const rowSelection = {
  deselectedRows: [3, 6, 100, 23], // those specific rows are deselected
  defaultSelection: true, // all other rows are selected
};

// or, for grouped data - this example assumes groupBy=continent,country,city
const rowSelection = {
  selectedRows: [
    45, // row with id 45 is selected, no matter the group
    ['Europe', 'France'], // all rows in Europe/France are selected
    ['Asia'], // all rows in Asia are selected
  ],
  deselectedRows: [
    ['Europe', 'France', 'Paris'], // all rows in Paris are deselected
  ],
  defaultSelection: false, // all other rows are selected
};
```

For using group keys in the selection value, see related <DPropLink name="useGroupKeysForMultiRowSelection" />

<Sandpack  title="Uncontrolled, multiple row selection with checkbox column">

```ts file=$DOCS/reference/uncontrolled-multiple-row-selection-example.page.tsx

```

</Sandpack>

</Prop>

<Prop name="defaultSortInfo" type="DataSourceSingleSortInfo<T>|DataSourceSingleSortInfo<T>[]|null">

> Information for sorting the data. This is an uncontrolled prop.

For detailed explanations, see <DataSourcePropLink name="sortInfo" />

<Note>

When you provide a `defaultSortInfo` prop and the sorting information uses a custom <DataSourcePropLink name="sortTypes">sortType</DataSourcePropLink>, make sure you specify that as the `type` property of the sorting info object.

```tsx
defaultSortInfo={{
  field: 'color',
  dir: 1,
  // note this custom sort type
  type: 'color',
}}
```

You will need to have a property for that type in your <DataSourcePropLink name="sortTypes"/> object as well.

```tsx
sortTypes={{
  color: (a, b) => //...
}}
```

</Note>

<Sandpack title="Local uncontrolled single sorting">

```ts file=$DOCS/learn/working-with-data/local-uncontrolled-single-sorting-example-with-remote-data.page.tsx

```

</Sandpack>

<Sandpack  title="Custom sort by color - magenta will come first">

```ts file=./customSortType-with-uncontrolled-sortInfo-example.page.tsx

```

</Sandpack>

</Prop>

<Prop name="lazyLoad" type="boolean|{batchSize:number}" defaultValue={false}>

> Whether the datasource will load data lazily - useful for server-side grouping and pivoting. If set to `true` or to an object (with `batchSize` property), the <DataSourcePropLink name="data" /> prop must be a function that returns a promise.

<Sandpack title="Server-side pivoting with full lazy load">

```ts file=$DOCS/learn/grouping-and-pivoting/pivoting/remote-pivoting-example.page.tsx

```

</Sandpack>

</Prop>

<Prop name="groupBy">

> An array of objects with `field` properties, that control how rows are being grouped.

Each item in the array can have the following properties:

- field - `keyof DATA_TYPE`
- column - config object for the group <PropLink name="column">column</PropLink>.

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

```ts file=$DOCS/learn/working-with-data/live-pagination-example.page.tsx

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

```ts file=$DOCS/learn/working-with-data/live-pagination-example.page.tsx

```

</Sandpack>

</Prop>

<Prop name="onDataParamsChange" type="(dataParams: DataSourceDataParams<DATA_TYPE:>)=>void">

> A function to be called when data-related props/state change.

Can be used to implement <DataSourcePropLink name="livePagination" />

The function is called with an object that has the following properties:

- `sortInfo` - current sort information - see <DataSourcePropLink name="sortInfo" /> for details
- `groupBy` - current grouping information - see <DataSourcePropLink name="groupBy" /> for details
- `filterValue` - current filtering information - see <DataSourcePropLink name="filterValue" /> for details
- `livePaginationCursor` - the value for the live pagination cursor - see <DataSourcePropLink name="livePaginationCursor" /> for details
- `changes` - an object that can help you figure out what change caused `onDataParamsChange` to be called.

<Sandpack  title="Live pagination - with react-query" deps="react-query">

```ts file=$DOCS/learn/working-with-data/live-pagination-example.page.tsx

```

</Sandpack>
</Prop>

<Prop name="onLivePaginationCursorChange" type="(cursor)=> void">

> A function to be called when the <DataSourcePropLink name="livePaginationCursor" /> changes.

Also see related <DataSourcePropLink name="onDataParamsChange" />.

</Prop>

<Prop name="onRowSelectionChange" type="(rowSelection, selectionMode='single-row'|'multi-row') => void">

> A function to be called when the <DPropLink name="rowSelection" /> changes.

<Sandpack  title="Controlled row selection with onRowSelectionChange">

<Description>

Use your mouse or keyboard (press the spacebar) to select/deselect a single row.

</Description>

```ts file=$DOCS/reference/controlled-single-row-selection-example.page.tsx

```

</Sandpack>

<Sandpack title="Multi row checkbox selection with grouping" >

<Description>

This example shows how you can use multiple row selection with a predefined controlled value.

Go ahead and select some groups/rows and see the selection value adjust.

The example also shows how you can use the `InfiniteTableApi` to retrieve the actual ids of the selected rows.

</Description>

```ts file=$DOCS/reference/controlled-multi-row-selection-example.page.tsx

```

</Sandpack>
</Prop>

<Prop name="rowSelection" type="string|number|null|object">

> Describes the selected row(s) in the `DataSource`

For single selection, the prop will be of type: `number | string | null`. Use `null` for empty selection in single selection mode.

For multiple selection, the prop will have the following shape:

```ts
const rowSelection = {
  selectedRows: [3, 6, 100, 23], // those specific rows are selected
  defaultSelection: false, // all rows deselected by default
};

// or
const rowSelection = {
  deselectedRows: [3, 6, 100, 23], // those specific rows are deselected
  defaultSelection: true, // all other rows are selected
};

// or, for grouped data - this example assumes groupBy=continent,country,city
const rowSelection = {
  selectedRows: [
    45, // row with id 45 is selected, no matter the group
    ['Europe', 'France'], // all rows in Europe/France are selected
    ['Asia'], // all rows in Asia are selected
  ],
  deselectedRows: [
    ['Europe', 'France', 'Paris'], // all rows in Paris are deselected
  ],
  defaultSelection: false, // all other rows are selected
};
```

For using group keys in the selection value, see related <DPropLink name="useGroupKeysForMultiRowSelection" />

<Sandpack  title="Single row selection (controlled) with onRowSelectionChange">

<Description>

Use your mouse or keyboard (press the spacebar) to select/deselect a single row.

</Description>

```ts file=$DOCS/reference/controlled-single-row-selection-example.page.tsx

```

</Sandpack>

<Note>

When <DPropLink name="lazyLoad" /> is being used - this means not all available groups/rows have actually been loaded yet in the dataset - we need a way to allow you to specify that those possibly unloaded rows/groups are selected or not. In this case, the `rowSelection.selectedRows`/`rowSelection.deselectedRows` arrays should not have row primary keys as strings/numbers, but rather rows/groups specified by their full path (so <DPropLink name="useGroupKeysForMultiRowSelection" /> should be set to `true`).

```ts {6}
// this example assumes groupBy=continent,country,city
const rowSelection = {
  selectedRows: [
    // row with id 45 is selected - we need this because in the lazyLoad scenario,
    // not all parents might have been made available yet
    ['Europe','Italy', 'Rome', 45],
    ['Europe','France'], // all rows in Europe/France are selected
    ['Asia'] // all rows in Asia are selected
  ]
  deselectedRows: [
    ['Europe','Italy','Rome'] // all rows in Rome are deselected
    // but note that row with id 45 is selected, so Rome will be rendered with an indeterminate selection state
  ],
  defaultSelection: false // all other rows are selected
}
```

In the example above, we know that there are 3 groups (`continent`, `country`, `city`), so any item in the array that has a 4th element is a fully specified leaf node. While lazy loading, we need this fully specified path for specific nodes, so we know which group rows to render with indeterminate selection.

</Note>

<Gotcha>

The <DPropLink name="useGroupKeysForMultiRowSelection" /> prop can be used for both lazy and non-lazy `DataSource` components.

</Gotcha>

<Sandpack title="Multi row checkbox selection with grouping" >

<Description>

This example shows how you can use multiple row selection with a predefined controlled value.

Go ahead and select some groups/rows and see the selection value adjust.

The example also shows how you can use the `InfiniteTableApi` to retrieve the actual ids of the selected rows.

</Description>

```ts file=$DOCS/reference/controlled-multi-row-selection-example.page.tsx

```

</Sandpack>

</Prop>

<Prop name="selectionMode" type="'single-row'|'multi-row'|false">

> Specifies the type of selection that should be enabled.

<HeroCards>
<YouWillLearnCard title="Selection Docs" path="../learn/selection/row-selection">

Read more on row selection (`multi-row` and `single-row`) and cell selection.

</YouWillLearnCard>
</HeroCards>

</Prop>

<Prop name="sortInfo" type="DataSourceSingleSortInfo<T>|DataSourceSingleSortInfo<T>[]|null">

> Information for sorting the data. This is a controlled prop.

Also see related <DataSourcePropLink name="defaultSortInfo" />, <DataSourcePropLink name="sortMode" />, <PropLink name="sortable" /> and <PropLink name="columns.sortable" />.

Sorting can be single (only one field/column can be sorted at a time) or multiple (multiple fields/columns can be sorted at the same time). Therefore, this property an be an array of objects or a single object (or null) - the shape of the objects (of type `DataSourceSingleSortInfo<T>`)is the following.

- `dir` - `1 | -1` - the direction of the sorting
- `field`? - `keyof DATA_TYPE` - the field to sort
- `id`? - `string` - if you don't sort by a field, you can specify an id of the column this sorting is bound to. Note that columns have a <PropLink name="columns.valueGetter">valueGetter</PropLink>, which will be used when doing local sorting and the column is not bound to an exact field.
- `type` - the sort type - one of the keys in <DataSourcePropLink name="sortTypes"/> - eg `"string"`, `"number"` - will be used for local sorting, to provide the proper comparison function.

When you want to use multiple sorting, but have no default sort order/information, use `[]` (the empty array) to denote multiple sorting should be enabled.

If no `sortInfo` is provided, by default, when clicking a sortable column, single sorting will be applied.

<Note>

For configuring if a column is sortable or not, see <PropLink name="columns.sortable" /> and <PropLink name="sortable" />. By default, all columns are sortable.

</Note>

<Sandpack title="Remote + controlled multi sorting">

```ts file=$DOCS/learn/working-with-data/remote-controlled-multi-sorting-example.page.tsx

```

</Sandpack>

</Prop>

<Prop name="sortMode" type="'local'|'remote'">

> Specifies where the sorting should be done.

See related <DataSourcePropLink name="sortInfo" /> and <DataSourcePropLink name="defaultSortInfo" />.

When set to `'local'`, the data is sorted locally (in the browser) after the data-source is loaded. When set to `'remote'`, the data should be sorted by the server (or by the data-source function that serves the data).

See [the Sorting page](/docs/learn/working-with-data/sorting) for more details.

</Prop>

<Prop name="sortTypes" type="Record<string, ((a,b) => number)>">

> Describes the available sorting functions used for local sorting. The object you provide will be merged into the default sort types.

Currently there are two `sortTypes` available:

- `"string"`
- `"number"`

Those values can be used for the <PropLink name="columns.sortType">column.sortType</PropLink> and <PropLink name="columns.sortType">column.dataType</PropLink> properties.

```ts
// default implementation
const sortTypes = {
  string: (a, b) => a.localeCompare(b),
  number: (a, b) => a - b,
};
```

When a column does not explicitly specify the <PropLink name="columns.sortType">column.sortType</PropLink>, the <PropLink name="columns.dataType">column.dataType</PropLink> will be used instead. And if no <PropLink name="columns.dataType">column.dataType</PropLink> is defined, it will default to `string`.

You can add new sort types to the DataSource and InfiniteTable components by specifying this property - the object will be merged into the default sort types.

<Sandpack  title="Custom sort by color - magenta will come first">

```ts file=./sortTypes-example.page.tsx

```

</Sandpack>

<Note>

In this example, for the `"color"` column, we specified <PropLink name="columns.sortType">column.sortType="color"</PropLink> - we could have passed that as `column.dataType` instead, but if the grid had filtering, it wouldn't know what filters to use for "color" - so we used<PropLink name="columns.sortType">column.sortType</PropLink> to only change how the data is sorted.

</Note>

</Prop>

<Prop name="useGroupKeysForMultiRowSelection" type="boolean" defaultValue={false}>

> Specifies whether <DPropLink name="rowSelection" /> contains group keys or only row ids/primary keys.

When this is `true`, you might want to use the [getSelectedPrimaryKeys](./selection-api#getSelectedPrimaryKeys) method.

<Sandpack title="Multi row checkbox selection using group keys" >

<Description>

This example shows how you can use have row selection with group keys instead of just the primary keys of rows.

</Description>

```ts file=$DOCS/reference/controlled-multi-row-selection-example-with-group-keys.page.tsx

```

</Sandpack>

</Prop>

</PropTable>
