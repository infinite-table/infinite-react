---
title: DataSource Props
layout: API
description: Props Reference page for your DataSource in Infinite Table - with complete examples
---

In the API Reference below we'll use **`DATA_TYPE`** to refer to the TypeScript type that represents the data the component is bound to.

<PropTable sort searchPlaceholder="Type to filter DataSource Props">

<Prop name="primaryKey" type="string | (data: DATA_TYPE) => string">

> The name of the id/primary key property of an item in the <DPropLink name="data" /> array. The value of this property needs to be unique.

This is probably one of the most important properties of the `<DataSource />` component, as it is used to identify items in the <DPropLink name="data" /> array.

<Note>

Unlike with other DataGrid components, with `InfiniteTable` you don't need to have a column mapped to the primary key field.

The primary key is used internally by the component and is not displayed in the grid if you don't explicitly have a column bound to that field.

</Note>

If the primary key is not unique, Infinite Table DataGrid won't work properly.

<Sandpack title="Simple demo of using primaryKey">

```ts file="data-example.page.tsx"

```

</Sandpack>

<Note>

The primary key can be either a string (the name of a property in the data object), or a function that returns a string.

Using functions (for more dynamic primary keys) is supported, but hasn't been tested extensively - so please report any issues you might encounter.

</Note>

</Prop>

<Prop name="treeExpandState" type="TreeExpandStateValue">

> Specifies the expand/collapse state of the tree nodes. See <TypeLink name="TreeExpandStateValue" /> for the shape of this object. For the uncontrolled version, see <DPropLink name="defaultTreeExpandState" />.

If no `treeExpandState` prop is specified, the tree will be rendered as fully expanded by default.

When using the controlled version, make sure to update the `treeExpandState` prop by using the <DPropLink name="onTreeExpandStateChange" /> callback.

<Sandpack title="Using controlled tree expand state" size="large">

```ts file="tree-controlled-expandstate-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="onTreeExpandStateChange" type="(treeExpandState: TreeExpandStateValue, {dataSourceApi,nodePath, nodeState}) => void">

> Called when the tree expand state changes.

When the user interacts with the tree (by expanding or collapsing a node), this callback is called with the new tree state.

The first parameter is the new tree state, and the second parameter is an object with the following properties:

- `dataSourceApi` - the <TypeLink name="DataSourceApi">DataSource API</TypeLink> instance
- `nodePath` - the path of the node that changed state. If the state was produced by an <TreeApiLink name="expandAll" /> or <TreeApiLink name="collapseAll" /> call, this will be `null`.
- `nodeState` - the new state of the node (`"collapsed"` or `"expanded"`)


<Sandpack title="Using the onTreeExpandStateChange callback">

```ts file="tree-controlled-expandstate-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="onNodeExpand" type="(nodePath: NodePath, {dataSourceApi}) => void">

> Called when a node is expanded. See related <DPropLink name="onNodeCollapse" /> and <DPropLink name="onTreeExpandStateChange" /> props.


<Note>

The <DPropLink name="onNodeExpand" /> and <DPropLink name="onNodeCollapse" /> callbacks are called when a node is expanded or collapsed, respectively - either via user interaction or by an API call. However, they will not be called when the <TreeApiLink name="expandAll" /> or <TreeApiLink name="collapseAll" /> methods are called.

</Note>

</Prop>

<Prop name="isNodeExpanded" type="(rowInfo: InfiniteTable_Tree_RowInfoParentNode<DATA_TYPE>, treeExpandState: TreeExpandState) => boolean">

> Decides if the current (non-leaf) node is expanded. 

The inverse prop, <DPropLink name="isNodeCollapsed" /> is also available. Only one of these props can be specified.

<Note>

If this prop is specified, <DPropLink name="treeSelectionState" /> is ignored.

</Note>

</Prop>

<Prop name="isNodeCollapsed" type="(rowInfo: InfiniteTable_Tree_RowInfoParentNode<DATA_TYPE>, treeExpandState: TreeExpandState) => boolean">

> Decides if the current (non-leaf) node is collapsed. See related <DPropLink name="treeExpandState" /> prop.

The inverse prop, <DPropLink name="isNodeExpanded" /> is also available. Only one of these props can be specified.

<Note>

If this prop is specified, <DPropLink name="treeSelectionState" /> is ignored.

</Note>

</Prop>

<Prop name="isNodeReadOnly" type="(rowInfo: InfiniteTable_Tree_RowInfoParentNode<DATA_TYPE>) => boolean">

> Decides if the current (non-leaf) node can be expanded or collapsed and if the tree icon is disabled.

By default, parent nodes with `children: []` are read-only, meaning they won't respond to expand/collapse clicks.

However, if you specify a custom `isNodeReadOnly` function, you can change this behavior.

<Note>

When a node is read-only, the <TreeApiLink name="expandNode" /> and <TreeApiLink name="collapseNode" /> methods need the `options.force` flag to be set to `true` in order to override the read-only restriction.

However, <TreeApiLink name="expandAll" /> and <TreeApiLink name="collapseAll" /> will work regardless of the `isNodeReadOnly` setting.

For full control over the expand/collapse state of read-only nodes, you can use the <DPropLink name="isNodeExpanded" />/<DPropLink name="isNodeCollapsed" /> props.

</Note>

<Sandpack title="Using a custom isNodeReadOnly function">

```ts file="tree-isNodeReadOnly-example.page.tsx"

```

</Sandpack>

</Prop>
<Prop name="onNodeCollapse" type="(nodePath: NodePath, {dataSourceApi}) => void">

> Called when a node is collapsed. See related <DPropLink name="onNodeExpand" /> and <DPropLink name="onTreeExpandStateChange" /> props.


<Note>

The <DPropLink name="onNodeExpand" /> and <DPropLink name="onNodeCollapse" /> callbacks are called when a node is expanded or collapsed, respectively - either via user interaction or by an API call. However, they will not be called when the <TreeApiLink name="expandAll" /> or <TreeApiLink name="collapseAll" /> methods are called.

</Note>

</Prop>

<Prop name="nodesKey" type="string" default="children">

> The name of the property in the data object that contains the child nodes for each tree node.

Only available when you're using the `<TreeDataSource />` component.

If not specified, it defaults to `"children"`.

<Note>

Each node gets a `nodePath` property, which is the array with the ids of all the parent nodes leading down to the current node. The node path includes the id of the current node

</Note>


```tsx {2} title="Node path vs row id"
const data = [
  { id: '1', name: 'Documents',                // path: ['1']
    children: [
      { id: '10', name: 'Private',             // path: ['1', '10']
        children: [
          { id: '100', name: 'Report.docx' },  // path: ['1', '10', '100'] 
          { id: '101', name: 'Vacation.docx' },// path: ['1', '10', '101']
        ],
      },
    ]
  },
  {
    id: '2',
    name: 'Downloads',                        // path: ['2']
    children: [
      {
        id: '20',
        name: 'cat.jpg',                      // path: ['2', '20']
      },
    ],
  },
];
```

<Sandpack title="Using a custom nodesKey prop">

```ts file="tree-nodesKey-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="defaultTreeExpandState" type="TreeExpandStateValue">

> Specifies the expand/collapse state of the tree nodes. See <TypeLink name="TreeExpandStateValue" /> for the shape of this object. For the controlled version, see <DPropLink name="treeExpandState" />.



<Sandpack title="Using uncontrolled tree expand state" size="large">

```ts file="tree-uncontrolled-expandstate-example.page.tsx"

```

</Sandpack>
</Prop>



<Prop name="isRowDisabled" type="(rowInfo: InfiniteTableRowInfo<T>) => boolean">

> This function ultimately decides the disabled state of a row. It overrides both <DPropLink name="defaultRowDisabledState" />/<DPropLink name="rowDisabledState" /> props.

It's called with a single argument - the <TypeLink name="InfiniteTableRowInfo">row info object</TypeLink> for the row in question.

It should return `true` if the row is disabled, and `false` otherwise.

<Note>

When this prop is used, <DPropLink name="onRowDisabledStateChange" /> will not be called.

</Note>

</Prop>


<Prop name="defaultRowDisabledState" type="{enabledRows,disabledRows}">

> The uncontrolled prop for managing row enabled/disabled state. For the controlled version see <DPropLink name="rowDisabledState" />. For listening to row disabled state changes, see <DPropLink name="onRowDisabledStateChange" />.

The value for this prop is an object with two properties:

- `enabledRows` - either `true` or an array of row ids that are enabled. When `true` is passed, `disabledRows` should be an array of row ids that are disabled.
- `disabledRows` - either `true` or an array of row ids that are disabled. When `true` is passed, `enabledRows` should be an array of row ids that are enabled.

<Note>

The values in the `enabledRows`/`disabledRows` arrays are row ids, and not indexes.

</Note>


<Note>

This prop can be overriden by using the <DPropLink name="isRowDisabled" /> prop.

</Note>

Here's an example of how to use the `defaultRowDisabledState` prop:

<Sandpack title="Using uncontrolled row disabled state">

<Description>

Rows with ids `1`, `3`, `4` and `5` are disabled.

</Description>

```ts file="defaultRowDisabledState-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="rowDisabledState" type="{enabledRows,disabledRows}">

> Manages row enabled/disabled state. For the uncontrolled version see <DPropLink name="defaultRowDisabledState" />. For listening to row disabled state changes, see <DPropLink name="onRowDisabledStateChange" />.

The value for this prop is an object with two properties:

- `enabledRows` - either `true` or an array of row ids that are enabled. When `true` is passed, `disabledRows` should be an array of row ids that are disabled.
- `disabledRows` - either `true` or an array of row ids that are disabled. When `true` is passed, `enabledRows` should be an array of row ids that are enabled.

<Note>
When using this controlled prop, you will need to update the `rowDisabledState` prop by using the <DPropLink name="onRowDisabledStateChange" /> callback.
</Note>

<Note>

This prop can be overriden by using the <DPropLink name="isRowDisabled" /> prop.

</Note>

<Sandpack title="Using controlled row disabled state">

<Description>

Rows with ids `1`, `3`, `4` and `5` are disabled initially.

Right click rows and use the context menu to enable/disable rows.

</Description>

```ts file="rowDisabledState-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="treeSelection" type="TreeSelectionValue">

> Determines what nodes are selected and deselected. For the uncontrolled version see <DPropLink name="defaultTreeSelection" />.

The value of this prop determines if a node is selected or not.

See <TypeLink name="TreeSelectionValue" /> for details on the shape of this object.


<Sandpack title="Using controlled tree selection" size="lg">

```ts file="tree-controlled-selectedstate-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="onTreeSelectionChange" type="(treeSelection: TreeSelectionValue, context) => void">

> Called when the tree selection changes. See <DPropLink name="treeSelection" />.

<Sandpack title="Reacting to tree selection changes" size="lg">

```ts file="tree-controlled-selectedstate-example.page.tsx"

```

</Sandpack>

When using `multi-row` <DPropLink name="selectionMode" />, the signature of this callback is:

 - `treeSelection` - the new <TypeLink name="TreeSelectionValue">tree selection state</TypeLink>
 - `context` - an object with the following properties:
   - `selectionMode` - will be `"multi-row"`
   - `lastUpdatedNodePath` - the path of the node that was last updated (either via user action or api call). Will be `null` of the action that triggered this callback was <TreeApiLink name="selectAll" /> or <TreeApiLink name="deselectAll" />.
   - `dataSourceApi` - the [DataSource API](/docs/reference/datasource-api) instance

</Prop>

<Prop name="defaultTreeSelection" type="TreeSelectionValue">

> Determines what nodes are selected and deselected. For the controlled version see <DPropLink name="treeSelection" />.

The value of this prop determines if a node is selected or not.

See <TypeLink name="TreeSelectionValue" /> for details on the shape of this object.


<Sandpack title="Using uncontrolled tree selection" size="lg">

```ts file="tree-uncontrolled-selectedstate-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="onRowDisabledStateChange" type="(rowDisabledState) => void">

> Called when the row disabled state changes.

It's called with just 1 argument (`rowDisabledState`), which is an instance of the `RowDisabledState` class. To get a literal object that represents the row disabled state, call the `rowDisabledState.getState()` method.

```tsx {3,19}
import {
  DataSource,
  RowDisabledStateObject,
} from '@infinite-table/infinite-react';
function App() {
  const [rowDisabledState, setRowDisabledState] = React.useState<
    RowDisabledStateObject<number>
  >({
    enabledRows: true,
    disabledRows: [1, 3, 4, 5],
  });
  return (
    <>
      <DataSource<Developer>
        data={data}
        primaryKey="id"
        rowDisabledState={rowDisabledState}
        onRowDisabledStateChange={(rowState) => {
          setRowDisabledState(rowState.getState());
        }}
      />
    </>
  );
}
```

<Note>
When using the controlled <DPropLink name="rowDisabledState" /> prop, you will need to update the `rowDisabledState` by using this callback.
</Note>

<Sandpack title="Using the onRowDisabledStateChange callback to update row disabled state">

<Description>

Rows with ids `1`, `3`, `4` and `5` are disabled initially.

Right click rows and use the context menu to enable/disable rows.

</Description>

```ts file="rowDisabledState-example.page.tsx"

```

</Sandpack>

</Prop>



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

<Prop name="data" type="DATA_TYPE[]|Promise<DATA_TYPE[]|(params:DataSourceDataParams) => DATA_TYPE[]|Promise<DATA_TYPE[]>">

> Specifies the data the component is bound to.

Can be one of the following:

- an array of the bound type - eg: `Employee[]`
- a Promise tha resolves to an array like the above
- a function that returns an any of the above

<Note>

If the `data` prop is a function, it will be called with an object of type <TypeLink name="DataSourceDataParams" />. <TypeLink name="DataSourceDataParams" code={false}>Click to see more details.</TypeLink>

</Note>

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

<Note>

You can control the visibility of the column filters by using the <PropLink name="showColumnFilters" /> prop.

</Note>

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

```ts file="$DOCS/learn/sorting/local-uncontrolled-single-sorting-example-with-remote-data.page.tsx"

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

<Prop name="batchOperationDelay" type="number">

> The delay in milliseconds to wait before mutations are applied. This is useful to batch multiple mutations together.

If not specified, a `requestAnimationFrame` will be used to batch mutations.

The following mutative operations are batched:
 
 - <DApiLink name="addData" />
 - <DApiLink name="addDataArray" />
 - <DApiLink name="insertData" />
 - <DApiLink name="insertDataArray" />
 - <DApiLink name="updateData" />
 - <DApiLink name="updateDataArray" />
 - <DApiLink name="removeData" />
 - <DApiLink name="removeDataArray" />
 - <DApiLink name="removeDataByPrimaryKey" />
 - <DApiLink name="removeDataArrayByPrimaryKeys" />
 - <DApiLink name="replaceAllData" />
 - <DApiLink name="clearAllData" />

</Prop>

<Prop name="treeFilterFunction" type="({ data, filterTreeNode, primaryKey }) => DATA_TYPE | boolean">

> A function to be used for filtering a `TreeDataSource`.

The function should return a boolean value or a data object.

- when returning `false` the current data object will be filtered out.
- when returning `true`, the current data object will be included in the filtered data, with no changes.
- when returning a data object, the object will be used instead of the current data object for the row. This means that you can modify the data object to only include some of its children (which match a specific criteria)

<Note>

The `treeFilterFunction` is called with an object that has a `filterTreeNode` function property. This function is a helper function you can use to continue the filtering further down the tree on the current (non-leaf) node.

This function will call the filtering function for each child of the current node. If all the children are filtered out, the current node will be filtered out as well. If there are any children that match the criteria, a clone of the current node will be returned with only the matching children.

You can opt to not use this helper function, and instead implement your own filtering logic. In this case, make sure you don't mutate data objects but rather return cloned versions of them.

</Note>

<Sandpack title="Tree filtering via treeFilterFunction">

```ts file=tree-filter-function-example.page.tsx

```

</Sandpack>

</Prop>

<Prop name="filterFunction" type="({ data, dataArray, index, primaryKey }) => boolean">

> A function to be used for client-side filtering.

Using this function will not show any special filtering UI for columns.

<Note>

For filtering when using a `TreeGrid`, see <DPropLink name="treeFilterFunction" />.

</Note>

<Sandpack title="Custom filterFunction example">

<Description>

Loads data from remote location but will only show rows that have `id > 100`.

</Description>

```ts file="custom-filter-function-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="shouldReloadData.filterValue" type="boolean">

> Explicitly configures where filtering will take place and if changes in the <DataSourcePropLink name="filterValue" /> should trigger a reload of the data source - applicable when <DPropLink name="data" /> is a function.
 Replaces the deprecated <DPropLink name="filterMode" />

- `false` (the default) - filtering will be done on the client side and the <DPropLink name="data" /> function will not be invoked again.
- `true` - filtering will be done on the server side - the <DPropLink name="data" /> function will be called with an object that includes the `filterValue` property, so it can be sent to the server

</Prop>

<Prop name="filterMode" type="'local'|'remote'" deprecated>

> Explicitly configures where filtering will take place. Update to use the <DPropLink name="shouldReloadData.filterValue" /> prop.

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
        },
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
      },
    ],
  },
};
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

- `filter` - an object describing the filter
  - `filter.value` - the value to filter by
  - `filter.type` - the current type of the filter (eg: `string`, `number` or another custom type you specify in the <DPropLink name="filterTypes">filterTypes</DPropLink> prop)
  - `filter.operator` - the name of the operator being applied
- `field` - the field being filtered - generally matched with a column. This is optional, as some columns can have no field.
- `id` - the id of the column being filtered. This is optional - for columns bound to a field, the `field` should be used instead of the `id`.
- `disabled` - whether this filter is applied or not

<Sandpack  title="Controlled filters with onFilterValueChange">

```ts file="onFilterValueChange-example.page.tsx"

```

</Sandpack>

<Note>

You can control the visibility of the column filters by using the <PropLink name="showColumnFilters" /> prop.

</Note>

</Prop>

<Prop name="lazyLoad" type="boolean|{batchSize:number}" defaultValue={false}>

> Whether the datasource will load data lazily - useful for server-side grouping and pivoting. If set to `true` or to an object (with `batchSize` property), the <DataSourcePropLink name="data" /> prop must be a function that returns a promise.

<Sandpack title="Server-side pivoting with full lazy load">

```ts file="$DOCS/learn/grouping-and-pivoting/pivoting/remote-pivoting-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="groupRowsState" type="{collapsedRows:true|[][], expandedRows:true|[][]}">

> Controls the expand/collapse state of group rows, when <DPropLink name="groupBy" /> is used


See related <DPropLink name="defaultGroupRowsState" />, <DPropLink name="onGroupRowsStateChange" /> and <DPropLink name="groupBy" />


```tsx title="Specifying the state for group rows"
const groupRowsState: DataSourcePropGroupRowsStateObject = {
  collapsedRows: true,
  expandedRows: [['Mexico'], ['Mexico', 'backend'], ['India']],
};
```

The two properties in this object are `collapsedRows` and `expandedRows`, and each can have the following values:
 - `true` - meaning that all groups have this state
 - an array of arrays - representing the exceptions to the default value


So if you have `collapsedRows` set to `true` and then `expandedRows` set to `[['Mexico'], ['Mexico', 'backend'], ['India']]` then all rows are collapsed by default, except the rows specified in the `expandedRows`.

<Sandpack title="Using controlled expanded/collapsed state for group rows">

```ts file="./group-rows-state-controlled-example.page.tsx"
```

</Sandpack>

</Prop>

<Prop name="onGroupRowsStateChange" type="(state: GroupRowsState) => void">

> Callback prop when the <DPropLink name="groupRowsState" /> changes.

See related <DPropLink name="groupRowsState" /> and <DPropLink name="groupBy" />

This function is called with an object that's an instance of <TypeLink name="GroupRowsState" />, when the user interacts with group rows and expands/collapses them.

If you want to get a plain object from this instance, call the `.getState()` method.

See <TypeLink name="GroupRowsState" /> reference to find out all the utility methods this instance gives you.

</Prop>

<Prop name="defaultGroupRowsState" type="{collapsedRows:true|[][], expandedRows:true|[][]}">

> Specifies the initial expand/collapse state of group rows, when <DPropLink name="groupBy" /> is used


For the controlled version, see related <DPropLink name="groupRowsState" />.


```tsx title="Specifying the initial state for group rows"
const defaultGroupRowsState: DataSourcePropGroupRowsStateObject = {
  expandedRows: true,
  collapsedRows: [['Mexico'], ['Mexico', 'backend'], ['India']],
};
```

The two properties in this object are `collapsedRows` and `expandedRows`, and each can have the following values:
 - `true` - meaning that all groups have this state
 - an array of arrays - representing the exceptions to the default value


So if you have `expandedRows` set to `true` and then `collapsedRows` set to `[['Mexico'], ['Mexico', 'backend'], ['India']]` then all rows are expanded by default, except the rows specified in the `collapsedRows`.

<Sandpack title="Specifying initial expanded/collapsed state for group rows">
```ts file="./group-rows-initial-state-example.page.tsx"
```
</Sandpack>

</Prop>

<Prop name="groupBy">

> An array of objects with `field` properties, that control how rows are being grouped.

Each item in the array can have the following properties:

- field - `keyof DATA_TYPE`
- column - config object for the group <PropLink name="column">column</PropLink> - see <DPropLink name="groupBy.column" />.

<Note>

When using <PropLink name="groupRenderStrategy" code={false}>groupRenderStrategy="multi-column"</PropLink>, it can be very useful for each group to configure it's own column - use <DPropLink name="groupBy.column" /> for this.
</Note>

See <TypeLink name="DataSourcePropGroupBy" /> for the type definition.

<Sandpack>

```ts file="groupBy-example.page.tsx"

```

```ts file="columns.ts"

```

</Sandpack>

</Prop>

<Prop name="pivotBy" type="DataSourcePivotBy<DATA_TYPE>[]">

> An array of objects with `field` properties that control how pivoting works. Pivoting is very often associated with aggregations, so see related <DPropLink name="aggregationReducers" /> for more details.

Each item in the array can have the following properties:

- field - `keyof DATA_TYPE`
- column - config object or function for generated pivot columns.

<Note>

For more details on the type of the items in this array prop, see <TypeLink name="DataSourcePivotBy" />.

</Note>

<Sandpack title="Pivoting with customized pivot column">

```ts file="$DOCS/learn/grouping-and-pivoting/pivoting/pivoting-customize-column-example.page.tsx"

```

</Sandpack>

</Prop>
 
<Prop name="groupBy.column" type="Partial<InfiniteTableColumn<T>>">

> An object that configures how the column for the current group should look like

If <PropLink name="groupColumn"/> is specified, it overrides this property (the objects actually get merged, with `groupColumn` having higher priority and being merged last).

<Note>

If you are using a <PropLink name="groupRenderStrategy" code={false}>groupRenderStrategy="single-column"</PropLink>, then using `groupBy.column` should not be used, as you could have many groups with conflicting column configuration.

In this case, use the <PropLink name="groupColumn"/> prop.

</Note>

<Sandpack>

<Description>

This example uses `groupBy.column` to configure the generated columns corresponding to each group.

</Description>

```ts file="groupBy-multi-with-column-example.page.tsx"

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

<Prop name="onDataMutations" type="({ mutations, dataArray, primaryKeyField }) => void">

> Callback prop to be called when the data changes via the DataSource API.

Called when any of the following methods have been called in the `DataSource` api

- <DApiLink name="updateData" />
- <DApiLink name="updateDataArray" />

- <DApiLink name="removeData" />
- <DApiLink name="removeDataArray" />

- <DApiLink name="removeDataByPrimaryKey" />
- <DApiLink name="removeDataArrayByPrimaryKeys" />

- <DApiLink name="insertData" />
- <DApiLink name="insertDataArray" />

- <DApiLink name="addData" />
- <DApiLink name="addDataArray" />

This callback is called with an object that has the following properties:

- `primaryKeyField` - the field configured as the primary key for the `<DataSource />`
- `mutations` - a `Map` with mutations. The keys in the map are primary keys of the mutated data

The values in the mutations are object descriptors of mutations, that have the following shape:

- `type`: `'insert'|'update'|'delete'`
- `originalData`: `DATA_TYPE | null` - the original data before the mutation. In case of `insert`, it will be `null`
- `data`: `Partial<DATA_TYPE>` - the updates to be performed on the data. In case of `delete`, it will be `undefined`. This is an object that will contain the primary key, and the updated values for the data (not necessarily the full object, except for `insert`, where it will be of type `DATA_TYPE`).

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

<Prop name="onCellSelectionChange" type="(cellSelection, selectionMode='multi-cell') => void">

> A function to be called when the <DPropLink name="cellSelection" /> changes.

<Sandpack  title="Controlled cell selection with onCellSelectionChange" size="lg">

<Description>

Use your mouse to select/deselect cells.

</Description>

```ts file="$DOCS/learn/selection/controlled-cell-selection-example.page.tsx"

```

</Sandpack>

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

<Note>

The <DPropLink name="useGroupKeysForMultiRowSelection" /> prop can be used for both lazy and non-lazy `DataSource` components.

</Note>

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

<Prop name="selectionMode" type="'single-row'|'multi-row'|'multi-cell'|false">

> Specifies the type of selection that should be enabled.

<HeroCards>
<YouWillLearnCard title="Row Selection Docs" path="/docs/learn/selection/row-selection">

Read more on row selection (`multi-row` and `single-row`).

</YouWillLearnCard>

<YouWillLearnCard title="Cell Selection Docs" path="/docs/learn/selection/cell-selection">

Read more on cell selection (`multi-cell` and `single-cell`).

</YouWillLearnCard>

</HeroCards>

<Sandpack title="Choose your selection mode between multi cell or multi row">

```ts file="selectionMode-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="sortFunction" type="(sortInfo:DataSourceSingleSortInfo<T>[], arr: T[]) => T[]">

> Custom sorting function to replace the `multisort` function used by default.

The function specified in the <DPropLink name="sortFunction" /> prop is called with the <DPropLink name="sortInfo" /> as the first argument and the data array as the second. It should return a sorted array, as per the <DPropLink name="sortInfo" /> it was called with.

<Note>

When <DPropLink name="sortFunction" /> is specified, <DPropLink name="shouldReloadData.sortInfo" /> will be forced to `false`, as the sorting is done in the browser.
</Note>

<Note>

The `@infinite-table/infinite-react` package exports a `multisort` function - this is the default function used for local sorting.

```ts
import { multisort } from '@infinite-table/infinite-react';

const arr: Developer[] = [
  /*...*/
];
const sortInfo = [
  {
    field: 'age',
    dir: -1,
  },
  {
    field: 'name',
    dir: 1,
  },
];
multisort(sortInfo, arr);
```

If you want to implement your own custom sort function, the `multisort` fn is a good starting point you can use.

</Note>

<Sandpack  title="Using a custom sortFunction">

```ts file="$DOCS/reference/datasource-props/local-sortFunction-single-sorting-example-with-local-data-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="sortInfo" type="DataSourceSingleSortInfo<T>|DataSourceSingleSortInfo<T>[]|null">

> Information for sorting the data. This is a controlled prop.

Also see related <DataSourcePropLink name="defaultSortInfo" /> (uncontrolled version), <DataSourcePropLink name="shouldReloadData.sortInfo" />, <PropLink name="sortable" /> and <PropLink name="columns.sortable" />.

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

```ts file="$DOCS/learn/sorting/remote-controlled-multi-sorting-example.page.tsx"

```

</Sandpack>

</Prop>



<Prop name="shouldReloadData.sortInfo" type="boolean">

> Specifies if changes in the <DataSourcePropLink name="sortInfo" /> should trigger a reload of the data source - applicable when <DPropLink name="data" /> is a function. Replaces the deprecated <DPropLink name="sortMode" />.

See related <DataSourcePropLink name="sortInfo" /> and <DataSourcePropLink name="defaultSortInfo" />.

When set to `false` (the default), the data is sorted locally (in the browser) after the data-source is loaded. When set to `true`, the data should be sorted by the server (or by the data-source function that serves the data).

See [the Sorting page](/docs/learn/sorting/overview) for more details.

For configuring the sorting behavior when multiple sorting is enabled, see <PropLink name="multiSortBehavior" />.

</Prop>

<Prop name="shouldReloadData" type="{ sortInfo, groupBy, filterValue, pivotBy }">

> Specifies which changes in the data-related props should trigger a reload of the data source - applicable when <DPropLink name="data" /> is a function.

See <DPropLink name="shouldReloadData.sortInfo" />.
See <DPropLink name="shouldReloadData.groupBy" />.
See <DPropLink name="shouldReloadData.filterValue" />.
See <DPropLink name="shouldReloadData.pivotBy" />.

</Prop>


<Prop name="sortMode" type="'local'|'remote'" deprecated>

> Specifies where the sorting should be done. Use <DPropLink name="shouldReloadData.sortInfo" /> instead.

See related <DPropLink name="sortInfo" /> and <DPropLink name="defaultSortInfo" />.

When set to `'local'`, the data is sorted locally (in the browser) after the data-source is loaded. When set to `'remote'`, the data should be sorted by the server (or by the data-source function that serves the data).

See [the Sorting page](/docs/learn/sorting/overview) for more details.

For configuring the sorting behavior when multiple sorting is enabled, see <PropLink name="multiSortBehavior" />.

</Prop>

<Prop name="sortTypes" type="Record<string, ((a,b) => number)>">

> Describes the available sorting functions used for local sorting. The object you provide will be merged into the default sort types.

Currently there are two `sortTypes` available:

- `"string"`
- `"number"`
- `"date"`

Those values can be used for the <PropLink name="columns.sortType">column.sortType</PropLink> and <PropLink name="columns.sortType">column.dataType</PropLink> properties.

```ts
// default implementation
const sortTypes = {
  string: (a, b) => a.localeCompare(b),
  number: (a, b) => a - b,
  date: (a, b) => a - b,
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
