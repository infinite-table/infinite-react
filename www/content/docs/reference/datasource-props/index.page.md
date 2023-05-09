---
title: DataSource Props
layout: API
description: Props Reference page for your DataSource in Infinite Table - with complete examples
---

In the API Reference below we'll use **`DATA_TYPE`** to refer to the TypeScript type that represents the data the component is bound to.

<PropTable>

<Prop name="aggregationReducers" type="Record<string, DataSourceAggregationReducer>">

> Specifies the functions to use for aggregating data. The object is a map where the keys are ids for aggregations and values are object of the shape described below.

The `DataSourceAggregationReducer` type can have the following properties

- `initialValue` - type `any`, mandatory for client-side aggregations. It can be a function, in which case, it will be called to compute the initial value for the aggregation. Otherwise, the initial value will be used as is.
- `field` - the field to aggregate on. Optional - if not specified, make sure you specify `getter`
- `getter`: `(data:T)=> any` - a getter function, called with the current `data` object.
- `reducer`: `string | (accumulator, value, data: T) => any` - either a string (for server-side aggregations) or a mandatory aggregation function for client-side aggregations.
- `done`: `(accumulator, arr: T[]) => any` - a function that is called to finish the aggregation after all values have been accumulated. The function should return the final value of the aggregation. Only used for client-side aggregations.
- `name` - useful especially in combination with <DataSourcePropLink name="pivotBy" />, as it will be used as the pivot column header.
- `pivotColumn` - if specified, will configure the pivot column generated for this aggregation. This object has the same shape as a normal <PropLink name="columns">column</PropLink>, but supports an extra `inheritFromColumn` property, which can either be a `string` (a column id), or a `boolean`. The default behavior for a pivot column is to inherit the configuration of the initial column that has the same `field` property. `inheritFromColumn` allows you to specify another column to inherit from, or, if `false` is passed, the pivot column will not inherit from any other column.

<Sandpack title="Aggregation demo - see `salary` column">

```ts file="groupBy-example.page.tsx"

```

```ts file="columns.ts"

```

</Sandpack>

Aggregation reducers can be used in combination with grouping and pivoting. The example below shows aggregations used with server-side pivoting

<Sandpack title="Aggregations used together with server-side pivoting">

```ts file="$DOCS/learn/grouping-and-pivoting/pivoting/remote-pivoting-example.page.tsx"

```

</Sandpack>

Pivot columns generated for aggregations will inehrit from initial columns - the example shows how to leverage this behavior and how to extend it

<Sandpack title="Pivot columns inherit from original columns bound to the same field">

```ts file="$DOCS/learn/grouping-and-pivoting/pivoting/pivot-column-inherit-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="data" type="DATA_TYPE[]|Promise<DATA_TYPE[]|() => DATA_TYPE[]|Promise<DATA_TYPE[]>">

> Specifies the data the component is bound to. Can be one of the following:

- an array of the bound type - eg: `Employee[]`
- a Promise tha resolves to an array like the above
- a function that returns an any of the above

<Sandpack title="Data loading example with promise">

```ts file="data-example.page.tsx"

```

</Sandpack>

<Note>

It's important to note you can re-fetch data by changing the reference you pass as the `data` prop to the `<DataSource/>` component. Passing another `data` function, will cause the component to re-execute the function and thus load new data.

</Note>

<Sandpack title="Re-fetching data">

```ts file="$DOCS/learn/working-with-data/refetch-example.page.tsx"

```

```ts file="$DOCS/learn/working-with-data/columns.ts" as="columns.ts"

```

</Sandpack>

</Prop>


<Prop name="defaultFilterValue" type="{field?, id?, filter: {type, operator, value}[]">

> Uncontrolled prop used for filtering. Can be used for both [client-side](/docs/learn/filtering/filtering-client-side) and [server-side](/docs/learn/filtering/filtering-server-side) filtering.



If you want to show the column filter editors, you have to either specify this property, or the controlled <DPropLink name="filterValue" /> - even if you have no initial filters. For no initial filters, use `defaultFilterValue=[]`.

For the controlled version, and more details on the shape of the objects in the array, see <DPropLink name="filterValue" />.

<Sandpack  title="Initial filtering applied via defaultFilterValue">

```ts file="defaultFilterValue-example.page.tsx"

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

```ts file="$DOCS/reference/uncontrolled-multiple-row-selection-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="defaultSortInfo" type="DataSourceSingleSortInfo<T>|DataSourceSingleSortInfo<T>[]|null">

> Information for sorting the data. This is an uncontrolled prop.

For detailed explanations, see <DataSourcePropLink name="sortInfo" /> (controlled property).

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

```ts file="$DOCS/learn/working-with-data/local-uncontrolled-single-sorting-example-with-remote-data.page.tsx"

```

</Sandpack>

<Sandpack  title="Custom sort by color - magenta will come first">

```ts file="./customSortType-with-uncontrolled-sortInfo-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="filterDelay" type="number" defaultValue={200}>

> The delay in milliseconds before the filter is applied. This is useful when you want to wait for the user to finish typing before applying the filter.


This is especially useful in order to reduce the number of requests sent to the server, when <DPropLink name="filterMode">remote filtering</DPropLink> is used.

If not specified, defaults to `200` milliseconds. This means, any changes to the column filters, that happen inside a 200ms window (or the current value of <DPropLink name="filterDelay"/>), will be debounced and only the last value will be sent to the server.

<Note>

If you want to prevent debouncing/batching filter values, you can set <DPropLink name="filterDelay"/> to `0`.

</Note>


</Prop>

<Prop name="filterFunction" type="({ data, dataArray, index, primaryKey }) => boolean">

> A function to be used for client-side filtering.

Using this function will not show any special filtering UI for columns.


<Sandpack title="Custom filterFunction example">

<Description>

Loads data from remote location but will only show rows that have `id > 100`.

</Description>

```ts file="custom-filter-function-example.page.tsx"
```

</Sandpack>


</Prop>

<Prop name="filterMode" type="'local'|'remote'">

> Explicitly configures where filtering will take place

- `'local'` - filtering will be done on the client side
- `'remote'` - filtering will be done on the server side - the <DPropLink name="data" /> function will be called with an object that includes the `filterValue` property, so it can be sent to the server

</Prop>

<Prop name="filterTypes" type="Record<string,{operators,emptyValues, defaultOperator}>">

> Specifies the available types of filters for the columns.

A filter type is a concept that defines how a certain type of data is to be filtered.
A filter type will have a key, used to define the filter in the `filterTypes` object, and also the following properties:
 - `label`
 - `emptyValues` - an array of values considered to be empty values - when any of these values is used in the filter, the filter will match all records.
 - `operators` - an array of operator this filter type supports
 - `defaultOperator` - the default operator for the filter type
 - `components` - an object that describes the custom components to be used for the filter type
    - `FilterEditor` - a custom filter editor component for this filter type
    - `FilterOperatorSwitch` - a custom component that is displayed at the left of the `FilterEditor` and can be used for switching between operators - only needed for very very advanced use-cases.

Let's imagine you have a `DataSource` with developers, each with a `salary` column, and for that column you want to allow `>`, `>=`, `<` and `<=` comparisons (operators).

For this, you would define the following filter type:

```tsx

const filterTypes = {
  income: {
    label: 'Income', 
    emptyValues: ['', null, undefined],
    defaultOperator: 'gt',
    operators: [
      {
        name: 'gt',
        label: 'Greater than',
        fn: ({ currentValue, filterValue }) => {
          return currentValue > filterValue;
        }
      },
      {
        name: 'gte',
        //...
      },
      {
        name: 'lt',
        //...
      },
      {
        name: 'lte',
        //...
      }
    ]
  }
}
```

<Note>

Each operator for a certain filter type needs to at least have a `name` and `fn` defined. The `fn` property is a function that will be called when client-side filtering is enabled, with an object that has the following properties:
 - `currentValue` - the cell value of the current row for the column being filtered
 - `filterValue` - the value of the filter editor
 - `emptyValues` - the array of values considered to be empty values for the filter type
 - `data` - the current row data object - `typeof DATA_TYPE`
 - `index` - the index of the current row in the table - `number`
 - `dataArray` - the array of all rows originally in the table - `typeof DATA_TYPE[]`
 - `field?` - the field the current column is bound to (can be undefined if the column is not bound to a field)

</Note>



<Sandpack title="Custom filter type used for the salary column">

<Description>

The `salary` column has a custom filter type, with the following operators: `gt`, `gte`, `lt` and `lte`.

</Description>

```ts file="filter-types-example.page.tsx"
```

</Sandpack>

<Note>

By default, the `string` and `number` filter types are available. You can import the default filter types like this:

```ts
import { defaultFilterTypes } from '@infinite-table/infinite-react';
```

If you want to make all your instances of `InfiniteTable` have new operators for those filter types, you can simply mutate the exported `defaultFilterTypes` object.


<Sandpack title="Enhanced string filter type - new 'Not includes' operator">

<Description>

The `string` columns have a new `Not includes` operator.

</Description>

```ts file="default-filter-types-example.page.tsx"
```

</Sandpack>

</Note>

<Note>

When you specify new <DPropLink name="filterTypes"/>, the default filter types of `string` and `number` are still available - unless the new object contains those keys and overrides them explicitly.

</Note>

The current implementation of the default filter types is the following:

```tsx
export const defaultFilterTypes: Record<string, DataSourceFilterType<T>> = {
    string: {
      label: 'Text',
      emptyValues: [''],
      defaultOperator: 'includes',
      components: {
        FilterEditor: StringFilterEditor,
      },
      operators: [
        {
          name: 'includes',
          components: {
            Icon: // custom icon as a React component ...
          },
          label: 'includes',
          fn: ({ currentValue, filterValue }) => {
            return (
              typeof currentValue === 'string' &&
              typeof filterValue == 'string' &&
              currentValue.toLowerCase().includes(filterValue.toLowerCase())
            );
          },
        },
        {
          label: 'Equals',
          components: {
            Icon: // custom icon as a React component ...
          },
          name: 'eq',
          fn: ({ currentValue: value, filterValue }) => {
            return typeof value === 'string' && value === filterValue;
          },
        },
        {
          name: 'startsWith',
          components: {
            Icon: // custom icon as a React component ...
          },
          label: 'Starts With',
          fn: ({ currentValue: value, filterValue }) => {
            return value.startsWith(filterValue);
          },
        },
        {
          name: 'endsWith',
          components: {
            Icon: // custom icon as a React component ...
          },
          label: 'Ends With',
          fn: ({ currentValue: value, filterValue }) => {
            return value.endsWith(filterValue);
          },
        },
      ],
    },
    number: {
      label: 'Number',
      emptyValues: ['', null, undefined],
      defaultOperator: 'eq',
      components: {
        FilterEditor: NumberFilterEditor,
      },
      operators: [
        {
          label: 'Equals',
          components: {
            Icon: // custom icon as a React component ...
          },
          name: 'eq',
          fn: ({ currentValue, filterValue }) => {
            return currentValue == filterValue;
          },
        },
        {
          label: 'Not Equals',
          components: {
            Icon: // custom icon as a React component ...
          },
          name: 'neq',
          fn: ({ currentValue, filterValue }) => {
            return currentValue != filterValue;
          },
        },
        {
          name: 'gt',
          label: 'Greater Than',
          components: {
            Icon: // custom icon as a React component ...
          },
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.includes(currentValue)) {
              return true;
            }
            return currentValue > filterValue;
          },
        },
        {
          name: 'gte',
          components: {
            Icon: // custom icon as a React component ...
          },
          label: 'Greater Than or Equal',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.includes(currentValue)) {
              return true;
            }
            return currentValue >= filterValue;
          },
        },
        {
          name: 'lt',
          components: {
            Icon: // custom icon as a React component ...
          },
          label: 'Less Than',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.includes(currentValue)) {
              return true;
            }
            return currentValue < filterValue;
          },
        },
        {
          name: 'lte',
          components: {
            Icon: // custom icon as a React component ...
          },
          label: 'Less Than or Equal',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.includes(currentValue)) {
              return true;
            }
            return currentValue <= filterValue;
          },
        }
      ],
    },
  };
```

</Prop>

<Prop name="filterTypes.components.FilterEditor">

> A custom React component to be used as an editor for the current filter type

Every filter type can define the following `components`
 - `FilterEditor` - a React component to be used as an editor for the current filter type
 - `FilterOperatorSwitch` - a custom component that is displayed at the left of the `FilterEditor` and can be used for switching between operators - only needed for very very advanced use-cases.

<Note>

Filter type operators can override the `FilterEditor` component - they can specify the following components:
  - `FilterEditor` - if specified, it overrides the `FilterEditor` of the filter type
  - `Icon` - a React component to be used as an icon for the operator - displayed by the menu triggered when clicking on the `FilterOperatorSwitch` component

</Note>

<Sandpack title="Demo of a custom filter editor">

<Description>

The `canDesign` column is using a custom `bool` filter type with a custom filter editor.

The checkbox has indeterminate state, which will match all values in the data source.

</Description>

```ts file="$DOCS/reference/hooks/custom-filter-editor-hooks-example.page.tsx"
```

</Sandpack>


</Prop>

<Prop name="filterValue" type="{field?, id?, filter: {type, operator, value}[]">

> Controlled prop used for filtering. Can be used for both [client-side](/docs/learn/filtering/filtering-client-side) and [server-side](/docs/learn/filtering/filtering-server-side) filtering.

For the uncontrolled version, see <DPropLink name="defaultFilterValue" />

If you want to show the column filter editors, you have to either specify this property, or the uncontrolled <DPropLink name="defaultFilterValue" /> - even if you have no initial filters. For no initial filters, use `filterValue=[]`.


The objects in this array have the following shape:

 * `filter` - an object describing the filter
    * `filter.value` - the value to filter by
    * `filter.type` - the current type of the filter (eg: `string`, `number` or another custom type you specify in the <DPropLink name="filterTypes">filterTypes</DPropLink> prop)
    * `filter.operator` - the name of the operator being applied
 * `field` - the field being filtered - generally matched with a column. This is optional, as some columns can have no field.
  * `id` - the id of the column being filtered. This is optional - for columns bound to a field, the `field` should be used instead of the `id`.
 * `disabled` - whether this filter is applied or not

<Sandpack  title="Controlled filters with onFilterValueChange">

```ts file="onFilterValueChange-example.page.tsx"

```

</Sandpack>


</Prop>

<Prop name="lazyLoad" type="boolean|{batchSize:number}" defaultValue={false}>

> Whether the datasource will load data lazily - useful for server-side grouping and pivoting. If set to `true` or to an object (with `batchSize` property), the <DataSourcePropLink name="data" /> prop must be a function that returns a promise.

<Sandpack title="Server-side pivoting with full lazy load">

```ts file="$DOCS/learn/grouping-and-pivoting/pivoting/remote-pivoting-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="groupBy">

> An array of objects with `field` properties, that control how rows are being grouped.

Each item in the array can have the following properties:

- field - `keyof DATA_TYPE`
- column - config object for the group <PropLink name="column">column</PropLink>.

<Sandpack>

```ts file="groupBy-example.page.tsx"

```

```ts file="columns.ts"

```

</Sandpack>

</Prop>

<Prop name="livePagination" type="boolean">

> Whether the component should use live pagination.

Use this in combination with <DataSourcePropLink name="livePaginationCursor" /> and <DataSourcePropLink name="onDataParamsChange" />

<Sandpack  title="Live pagination - with react-query" deps="react-query">

```ts file="$DOCS/learn/working-with-data/live-pagination-example.page.tsx"

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

```ts file="$DOCS/learn/working-with-data/live-pagination-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="onDataParamsChange" type="(dataParams: DataSourceDataParams<DATA_TYPE:>)=>void">

> A function to be called when data-related state changes.

Can be used to implement <DataSourcePropLink name="livePagination" />

The function is called with an object that has the following properties:

- `sortInfo` - current sort information - see <DataSourcePropLink name="sortInfo" /> for details
- `groupBy` - current grouping information - see <DataSourcePropLink name="groupBy" /> for details
- `filterValue` - current filtering information - see <DataSourcePropLink name="filterValue" /> for details
- `livePaginationCursor` - the value for the live pagination cursor - see <DataSourcePropLink name="livePaginationCursor" /> for details
- `changes` - an object that can help you figure out what change caused `onDataParamsChange` to be called.

<Sandpack  title="Live pagination - with react-query" deps="react-query">

```ts file="$DOCS/learn/working-with-data/live-pagination-example.page.tsx"

```

</Sandpack>
</Prop>

<Prop name="onFilterValueChange" type="({field?, id?, filter: {type, operator, value}[]) => void">

> Callback prop called when the <DPropLink name="filterValue" /> changes.

This might not be called immediately, as there might be a <DPropLink name="filterDelay"/> set.


<Sandpack  title="Controlled filters with onFilterValueChange">

```ts file="onFilterValueChange-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="onLivePaginationCursorChange" type="(cursor)=> void">

> A function to be called when the <DataSourcePropLink name="livePaginationCursor" /> changes.

Also see related <DataSourcePropLink name="onDataParamsChange" />.

</Prop>


<Prop name="onReady" type="(dataSourceApi: DataSourceApi<DATA_TYPE>) => void">

> The callback that is called when the `DataSource` is ready. The [`dataSourceApi`](/docs/reference/datasource-api) is passed as the first argument.


</Prop>

<Prop name="onRowSelectionChange" type="(rowSelection, selectionMode='single-row'|'multi-row') => void">

> A function to be called when the <DPropLink name="rowSelection" /> changes.

<Sandpack  title="Controlled row selection with onRowSelectionChange">

<Description>

Use your mouse or keyboard (press the spacebar) to select/deselect a single row.

</Description>

```ts file="$DOCS/reference/controlled-single-row-selection-example.page.tsx"

```

</Sandpack>

<Sandpack title="Multi row checkbox selection with grouping" >

<Description>

This example shows how you can use multiple row selection with a predefined controlled value.

Go ahead and select some groups/rows and see the selection value adjust.

The example also shows how you can use the `InfiniteTableApi` to retrieve the actual ids of the selected rows.

</Description>

```ts file="$DOCS/reference/controlled-multi-row-selection-example.page.tsx"

```

</Sandpack>
</Prop>

<Prop name="onSortInfoChange" type="(sortInfo | null) => void">

> Called when sorting changes on the DataSource.

The sorting can change either via a user interaction or by calling an API method (from the [root API](api) or the [Column API](column-api)).

See related <DataSourcePropLink name="sortInfo" /> for controlled sorting and <DataSourcePropLink name="defaultSortInfo" /> for uncontrolled sorting.

</Prop>

<Prop name="refetchKey" type="string|number|object">

> A value that can be used to trigger a re-fetch of the data.

By updating the value of this prop (eg: you can use it as a counter, and increment it) the `<DataSource />` component reloads it's <DPropLink name="data" /> if it's defined as a function. More specifically, the `data` function is called again and the result will replace the current data.


<Sandpack title="Re-fetching data via refetchKey updates" >

<Description>

This example shows how you can use the `refetchKey` to trigger reloading the data

</Description>

```ts file="refetchKey-example.page.tsx"

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

```ts file="$DOCS/reference/controlled-single-row-selection-example.page.tsx"

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

```ts file="$DOCS/reference/controlled-multi-row-selection-example.page.tsx"

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

Also see related <DataSourcePropLink name="defaultSortInfo" /> (uncontrolled version), <DataSourcePropLink name="sortMode" />, <PropLink name="sortable" /> and <PropLink name="columns.sortable" />.

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

```ts file="$DOCS/learn/working-with-data/remote-controlled-multi-sorting-example.page.tsx"

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

```ts file="./sortTypes-example.page.tsx"

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

```ts file="$DOCS/reference/controlled-multi-row-selection-example-with-group-keys.page.tsx"

```

</Sandpack>

</Prop>

</PropTable>
