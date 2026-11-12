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

```tsx file="data-example.demo.tsx" title="Simple demo of using primaryKey"
```

<Note>

The primary key can be either a string (the name of a property in the data object), or a function that returns a string.

Using functions (for more dynamic primary keys) is supported, but hasn't been tested extensively - so please report any issues you might encounter.

</Note>

</Prop>

<Prop name="treeExpandState" type="TreeExpandStateValue">

> Specifies the expand/collapse state of the tree nodes. See <TypeLink name="TreeExpandStateValue" /> for the shape of this object. For the uncontrolled version, see <DPropLink name="defaultTreeExpandState" />.

If no `treeExpandState` prop is specified, the tree will be rendered as fully expanded by default.

When using the controlled version, make sure to update the `treeExpandState` prop by using the <DPropLink name="onTreeExpandStateChange" /> callback.

```tsx file="tree-controlled-expandstate-example.demo.tsx" title="Using controlled tree expand state" height="large"
```

</Prop>

<Prop name="onTreeExpandStateChange" type="(treeExpandState: TreeExpandStateValue, {dataSourceApi,nodePath, nodeState}) => void">

> Called when the tree expand state changes.

When the user interacts with the tree (by expanding or collapsing a node), this callback is called with the new tree state.

The first parameter is the new tree state, and the second parameter is an object with the following properties:

- `dataSourceApi` - the <TypeLink name="DataSourceApi">DataSource API</TypeLink> instance
- `nodePath` - the path of the node that changed state. If the state was produced by an <TreeApiLink name="expandAll" /> or <TreeApiLink name="collapseAll" /> call, this will be `null`.
- `nodeState` - the new state of the node (`"collapsed"` or `"expanded"`)


```tsx file="tree-controlled-expandstate-example.demo.tsx" title="Using the onTreeExpandStateChange callback"
```

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

```tsx file="tree-isNodeReadOnly-example.demo.tsx" title="Using a custom isNodeReadOnly function"
```

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


```tsx file="index.snippet.tsx" region="node-path-vs-row-id" title="Node path vs row id"
```

```tsx file="tree-nodesKey-example.demo.tsx" title="Using a custom nodesKey prop"
```

</Prop>

<Prop name="defaultTreeExpandState" type="TreeExpandStateValue">

> Specifies the expand/collapse state of the tree nodes. See <TypeLink name="TreeExpandStateValue" /> for the shape of this object. For the controlled version, see <DPropLink name="treeExpandState" />.



```tsx file="tree-uncontrolled-expandstate-example.demo.tsx" title="Using uncontrolled tree expand state" height="large"
```
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

<DemoTitle>Using uncontrolled row disabled state</DemoTitle>
<DemoDescription>

Rows with ids `1`, `3`, `4` and `5` are disabled.

</DemoDescription>

```tsx file="defaultRowDisabledState-example.demo.tsx"
```

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

<DemoTitle>Using controlled row disabled state</DemoTitle>
<DemoDescription>

Rows with ids `1`, `3`, `4` and `5` are disabled initially.

Right click rows and use the context menu to enable/disable rows.

</DemoDescription>

```tsx file="rowDisabledState-example.demo.tsx"
```

</Prop>

<Prop name="treeSelection" type="TreeSelectionValue">

> Determines what nodes are selected and deselected. For the uncontrolled version see <DPropLink name="defaultTreeSelection" />.

The value of this prop determines if a node is selected or not.

See <TypeLink name="TreeSelectionValue" /> for details on the shape of this object.


```tsx file="tree-controlled-selectedstate-example.demo.tsx" title="Using controlled tree selection" height="large"
```

</Prop>

<Prop name="onTreeSelectionChange" type="(treeSelection: TreeSelectionValue, context) => void">

> Called when the tree selection changes. See <DPropLink name="treeSelection" />.

```tsx file="tree-controlled-selectedstate-example.demo.tsx" title="Reacting to tree selection changes" height="large"
```

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


```tsx file="tree-uncontrolled-selectedstate-example.demo.tsx" title="Using uncontrolled tree selection" height="large"
```

</Prop>

<Prop name="onRowDisabledStateChange" type="(rowDisabledState) => void">

> Called when the row disabled state changes.

It's called with just 1 argument (`rowDisabledState`), which is an instance of the `RowDisabledState` class. To get a literal object that represents the row disabled state, call the `rowDisabledState.getState()` method.

```tsx file="index.snippet.tsx" region="onrowdisabledstatechange"
```

<Note>
When using the controlled <DPropLink name="rowDisabledState" /> prop, you will need to update the `rowDisabledState` by using this callback.
</Note>

<DemoTitle>Using the onRowDisabledStateChange callback to update row disabled state</DemoTitle>
<DemoDescription>

Rows with ids `1`, `3`, `4` and `5` are disabled initially.

Right click rows and use the context menu to enable/disable rows.

</DemoDescription>

```tsx file="rowDisabledState-example.demo.tsx"
```

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
- `pivotColumn` - if specified, will configure the pivot column generated for this aggregation. This object has the same shape as a normal <PropLink name="columns">column</PropLink>, but supports some extra props like `inheritFromColumn` See <DPropLink name="aggregationReducers.pivotColumn" />.

<DemoTitle>Aggregation demo - see `salary` column</DemoTitle>

```tsx file="groupBy-example.demo.tsx"
```

Aggregation reducers can be used in combination with grouping and pivoting. The example below shows aggregations used with server-side pivoting

```tsx file="/docs/learn/grouping-and-pivoting/pivoting/remote-pivoting-example.demo.tsx" title="Aggregations used together with server-side pivoting"
```

Pivot columns generated for aggregations will inehrit from initial columns - the example shows how to leverage this behavior and how to extend it

```tsx file="/docs/learn/grouping-and-pivoting/pivoting/pivot-column-inherit-example.demo.tsx" title="Pivot columns inherit from original columns bound to the same field"
```

</Prop>

<Prop name="aggregationReducers.pivotColumn" type="Partial<InfiniteTableColumn<T>> | (({ column }) => Partial<InfiniteTableColumn<T>>)">

> Configures the generated pivot columns for this aggregation only.

Has the same shape as a normal <PropLink name="columns">column</PropLink> (or a function that returns one). Use it when you want a setting — <PropLink name="columns.defaultSortable" nocode>defaultSortable</PropLink>, `header`, `defaultWidth`,`style` - to apply to columns generated for this reducer, and not to other aggregations.

Also supports <DPropLink name="aggregationReducers.pivotColumn.inheritFromColumn" /> to control which original column (if any) the generated columns inherit from.

```ts file="index.snippet.tsx" region="aggregationreducers-pivotcolumn"
```

In the example above, only the `salary` pivot columns are sortable. See [customizing pivot columns](/docs/learn/grouping-and-pivoting/pivoting/customizing-pivot-columns) for the other override points (<PropLink name="pivotColumn" /> and <DataSourcePropLink name="pivotBy.column" />).

</Prop>

<Prop name="aggregationReducers.pivotColumn.inheritFromColumn" type="string | boolean">

> Controls which original <PropLink name="columns">column</PropLink> the generated pivot columns inherit from.

By default, pivot columns inherit the configuration of the initial column bound to the same `field` as the aggregation. `inheritFromColumn` lets you change that:

- a `string` — the id of another column to inherit from
- `false` — do not inherit from any column
- `true` or omitted — inherit from the column bound to the aggregator's `field` (the default)

```ts file="index.snippet.tsx" region="aggregationreducers-pivotcolumn-2"
```

```tsx file="/docs/learn/grouping-and-pivoting/pivoting/pivot-column-inherit-example.demo.tsx" title="Pivot columns inherit from original columns bound to the same field"
```

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

```tsx file="data-example.demo.tsx" title="Data loading example with promise"
```

<Note>

It's important to note you can re-fetch data by changing the reference you pass as the `data` prop to the `<DataSource/>` component. Passing another `data` function, will cause the component to re-execute the function and thus load new data.

</Note>

```tsx file="/docs/learn/working-with-data/refetch-example.demo.tsx" title="Re-fetching data"
```

</Prop>

<Prop name="defaultFilterValue" type="{field?, id?, filter: {type, operator, value}[]">

> Uncontrolled prop used for filtering. Can be used for both [client-side](/docs/learn/filtering/filtering-client-side) and [server-side](/docs/learn/filtering/filtering-server-side) filtering.

If you want to show the column filter editors, you have to either specify this property, or the controlled <DPropLink name="filterValue" /> - even if you have no initial filters. For no initial filters, use `defaultFilterValue=[]`.

For the controlled version, and more details on the shape of the objects in the array, see <DPropLink name="filterValue" />.

```tsx file="defaultFilterValue-example.demo.tsx" title="Initial filtering applied via defaultFilterValue"
```

<Note>

You can control the visibility of the column filters by using the <PropLink name="showColumnFilters" /> prop.

</Note>

</Prop>

<Prop name="defaultRowSelection" type="string|number|null|object">

> Describes the selected row(s) in the `DataSource`

See more docs in the controlled version of this prop, <PropLink name="rowSelection" />

For single selection, the prop will be of type: `number | string | null`. Use `null` for empty selection in single selection mode.

For multiple selection, the prop will have the following shape:

```ts file="index.snippet.tsx" region="defaultrowselection"
```

For using group keys in the selection value, see related <DPropLink name="useGroupKeysForMultiRowSelection" />

```tsx file="/docs/reference/uncontrolled-multiple-row-selection-example.demo.tsx" title="Uncontrolled, multiple row selection with checkbox column"
```

</Prop>

<Prop name="defaultSortInfo" type="DataSourceSingleSortInfo<T>|DataSourceSingleSortInfo<T>[]|null">

> Information for sorting the data. This is an uncontrolled prop.

For detailed explanations, see <DataSourcePropLink name="sortInfo" /> (controlled property).

<Note>

When you provide a `defaultSortInfo` prop and the sorting information uses a custom <DataSourcePropLink name="sortTypes">sortType</DataSourcePropLink>, make sure you specify that as the `type` property of the sorting info object.

```tsx file="index.snippet.tsx" region="defaultsortinfo"
```

You will need to have a property for that type in your <DataSourcePropLink name="sortTypes"/> object as well.

```tsx file="index.snippet.tsx" region="defaultsortinfo-2"
```

</Note>

```tsx file="/docs/learn/sorting/local-uncontrolled-single-sorting-example-with-remote-data.demo.tsx" title="Local uncontrolled single sorting"
```

```tsx file="customSortType-with-uncontrolled-sortInfo-example.demo.tsx" title="Custom sort by color - magenta will come first"
```

</Prop>

<Prop name="filterDelay" type="number" defaultValue={200}>

> The delay in milliseconds before the filter is applied. This is useful when you want to wait for the user to finish typing before applying the filter.

This is especially useful in order to reduce the number of requests sent to the server, when <DPropLink name="shouldReloadData.filterValue">remote filtering</DPropLink> is used.

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

<Prop name="treeFilterFunction" type="({ data, isLeafNode, filterTreeNode, filterValue, filterTypes, primaryKey }) => DATA_TYPE | boolean">

> A function to be used for filtering a `TreeDataSource` in the browser. It replaces the built-in column filtering.

The function is called for the nodes of the top level, and should return a boolean value or a data object.

- when returning `false` the current data object will be filtered out.
- when returning `true`, the current data object will be included in the filtered data, with no changes.
- when returning a data object, the object will be used instead of the current data object for the row. This means that you can modify the data object to only include some of its children (which match a specific criteria)

The param also has:

- `isLeafNode` - whether the current node is a leaf node.
- `filterValue` and `filterTypes` - the current column filters (see <DPropLink name="filterValue" />), so you can apply them with `defaultFilterFunction`.

<Note>

The `treeFilterFunction` is called with an object that has a `filterTreeNode` function property. This function is a helper function you can use to continue the filtering further down the tree on the current (non-leaf) node.

This function will call the filtering function for each child of the current node. If all the children are filtered out, the current node will be filtered out as well. If there are any children that match the criteria, a clone of the current node will be returned with only the matching children.

You can opt to not use this helper function, and instead implement your own filtering logic. In this case, make sure you don't mutate data objects but rather return cloned versions of them.

</Note>

When there is no `treeFilterFunction`, the column filters are applied with `defaultTreeFilterFunction`, which you can also import and call from your own function:

```ts file="index.snippet.tsx" region="treefilterfunction"
```

`defaultTreeFilterFunction` matches only the leaf nodes against the column filters - the fields of a parent node are not matched.

A `treeFilterFunction` has no effect with <DPropLink name="lazyLoad" />.

```tsx file="tree-filter-function-example.demo.tsx" title="Tree filtering via treeFilterFunction"
```

</Prop>

<Prop name="filterFunction" type="({ data, dataArray, index, primaryKey, filterValue, filterTypes }) => boolean">

> A function to be used for filtering in the browser - you decide how the rows are filtered.

The function is called for every row, and returns whether the row is kept. Its param also has the current column filters (<DPropLink name="filterValue" />, as `filterValue` and `filterTypes`), so the function can filter in any way you want:

- call `defaultFilterFunction`, which Infinite Table exports, to filter by the column filters the same way the built-in filtering does;
- use your own logic;
- or combine the two.

```ts file="index.filterfunction.snippet.tsx" region="filterfunction"
```

A `filterFunction` makes the filtering happen in the browser. Combine it with <DPropLink name="shouldReloadData.filterValue">shouldReloadData.filterValue: true</DPropLink> when the <DPropLink name="data" /> function should also be called again on every filter change - the returned rows are then filtered in the browser.

A `filterFunction` has no effect with <DPropLink name="lazyLoad" />: the rows that are not loaded yet can't be filtered in the browser.

<Note>

For filtering when using a `TreeGrid`, see <DPropLink name="treeFilterFunction" />. When both are specified for tree data, only the `treeFilterFunction` is used.

</Note>

<DemoTitle>Custom filterFunction example</DemoTitle>
<DemoDescription>

Loads data from remote location but will only show rows that have `id > 100`.

</DemoDescription>

```tsx file="custom-filter-function-example.demo.tsx"
```

</Prop>

<Prop name="shouldReloadData.filterValue" type="boolean">

> Specifies if changes in the <DataSourcePropLink name="filterValue" /> should trigger a reload of the data source - and so, that the data is filtered by whoever provides it.

- `false` - filtering is done in the browser and the <DPropLink name="data" /> function is not called again. This is the default - for both controlled and uncontrolled filtering - unless <DPropLink name="lazyLoad" /> or <DPropLink name="livePagination" /> is used.
- `true` - the data is filtered by whoever provides it. When <DPropLink name="data" /> is a function, it's called again on every filter change, with the `filterValue` in its params, so it can be sent to the server. When <DPropLink name="data" /> is an array, you pass a new, filtered array (eg from <DPropLink name="onFilterValueChange" />). The rows are shown as they come in - unless a <DPropLink name="filterFunction" /> is specified, in which case they are filtered again in the browser. This is the default with <DPropLink name="lazyLoad" /> and <DPropLink name="livePagination" />.

See [Sorting and filtering the data yourself](/docs/learn/working-with-data/sorting-and-filtering-the-data-yourself).

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

```tsx file="index.snippet.tsx" region="filtertypes"
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

<DemoTitle>Custom filter type used for the salary column</DemoTitle>
<DemoDescription>

The `salary` column has a custom filter type, with the following operators: `gt`, `gte`, `lt` and `lte`.

</DemoDescription>

```tsx file="filter-types-example.demo.tsx"
```

<Note>

By default, the `string` and `number` filter types are available. You can import the default filter types like this:

```ts file="index.snippet.tsx" region="filtertypes-2"
```

If you want to make all your instances of `InfiniteTable` have new operators for those filter types, you can simply mutate the exported `defaultFilterTypes` object.

<DemoTitle>Enhanced string filter type - new 'Not includes' operator</DemoTitle>
<DemoDescription>

The `string` columns have a new `Not includes` operator.

</DemoDescription>

```tsx file="default-filter-types-example.demo.tsx"
```

</Note>

<Note>

When you specify new <DPropLink name="filterTypes"/>, the default filter types of `string` and `number` are still available - unless the new object contains those keys and overrides them explicitly.

</Note>

The current implementation of the default filter types is the following:

```tsx file="index.filtertypes.snippet.tsx" region="filtertypes"
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

<DemoTitle>Demo of a custom filter editor</DemoTitle>
<DemoDescription>

The `canDesign` column is using a custom `bool` filter type with a custom filter editor.

The checkbox has indeterminate state, which will match all values in the data source.

</DemoDescription>

```tsx file="/docs/reference/hooks/custom-filter-editor-hooks-example.demo.tsx"
```

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

```tsx file="onFilterValueChange-example.demo.tsx" title="Controlled filters with onFilterValueChange"
```

<Note>

You can control the visibility of the column filters by using the <PropLink name="showColumnFilters" /> prop.

</Note>

</Prop>

<Prop name="lazyLoad" type="boolean|{batchSize:number}" defaultValue={false}>

> Whether the datasource will load data lazily - useful for server-side grouping and pivoting. If set to `true` or to an object (with `batchSize` property), the <DataSourcePropLink name="data" /> prop must be a function that returns a promise.

```tsx file="/docs/learn/grouping-and-pivoting/pivoting/remote-pivoting-example.demo.tsx" title="Server-side pivoting with full lazy load"
```

</Prop>

<Prop name="groupRowsState" type="{collapsedRows:true|[][], expandedRows:true|[][]}">

> Controls the expand/collapse state of group rows, when <DPropLink name="groupBy" /> is used


See related <DPropLink name="defaultGroupRowsState" />, <DPropLink name="onGroupRowsStateChange" /> and <DPropLink name="groupBy" />


```tsx file="index.snippet.tsx" region="specifying-the-state-for-group-rows" title="Specifying the state for group rows"
```

The two properties in this object are `collapsedRows` and `expandedRows`, and each can have the following values:
 - `true` - meaning that all groups have this state
 - an array of arrays - representing the exceptions to the default value


So if you have `collapsedRows` set to `true` and then `expandedRows` set to `[['Mexico'], ['Mexico', 'backend'], ['India']]` then all rows are collapsed by default, except the rows specified in the `expandedRows`.

```tsx file="group-rows-state-controlled-example.demo.tsx" title="Using controlled expanded/collapsed state for group rows"
```

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


```tsx file="index.snippet.tsx" region="specifying-the-initial-state-for-group-rows" title="Specifying the initial state for group rows"
```

The two properties in this object are `collapsedRows` and `expandedRows`, and each can have the following values:
 - `true` - meaning that all groups have this state
 - an array of arrays - representing the exceptions to the default value


So if you have `expandedRows` set to `true` and then `collapsedRows` set to `[['Mexico'], ['Mexico', 'backend'], ['India']]` then all rows are expanded by default, except the rows specified in the `collapsedRows`.

```tsx file="group-rows-initial-state-example.demo.tsx" title="Specifying initial expanded/collapsed state for group rows"
```

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

```tsx file="groupBy-example.demo.tsx"
```

</Prop>

<Prop name="pivotBy" type="DataSourcePivotBy<DATA_TYPE>[]">

> An array of objects with `field` properties that control how pivoting works. Pivoting is very often associated with aggregations, so see related <DPropLink name="aggregationReducers" /> for more details.

Each item in the array can have the following properties:

- field - `keyof DATA_TYPE`
- column - config object or function for generated pivot columns.

<Note>

For more details on the type of the items in this array prop, see <TypeLink name="DataSourcePivotBy" />.

</Note>

```tsx file="/docs/learn/grouping-and-pivoting/pivoting/pivoting-customize-column-example.demo.tsx" title="Pivoting with customized pivot column"
```

</Prop>
 
<Prop name="groupBy.column" type="Partial<InfiniteTableColumn<T>>">

> An object that configures how the column for the current group should look like

If <PropLink name="groupColumn"/> is specified, it overrides this property (the objects actually get merged, with `groupColumn` having higher priority and being merged last).

<Note>

If you are using a <PropLink name="groupRenderStrategy" code={false}>groupRenderStrategy="single-column"</PropLink>, then using `groupBy.column` should not be used, as you could have many groups with conflicting column configuration.

In this case, use the <PropLink name="groupColumn"/> prop.

</Note>

<DemoDescription>

This example uses `groupBy.column` to configure the generated columns corresponding to each group.

</DemoDescription>

```tsx file="groupBy-multi-with-column-example.demo.tsx"
```

</Prop>

<Prop name="livePagination" type="boolean">

> Whether the component should use live pagination.

Use this in combination with <DataSourcePropLink name="livePaginationCursor" /> and <DataSourcePropLink name="onDataParamsChange" />

```tsx file="/docs/learn/working-with-data/live-pagination-example.demo.tsx" title="Live pagination - with react-query"
```

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

```tsx file="/docs/learn/working-with-data/live-pagination-example.demo.tsx" title="Live pagination - with react-query"
```

</Prop>

<Prop name="multiRowSelectionTarget" type="'all'|'visible'" defaultValue="'all'">

> When some rows are filtered out, decides which rows the header selection checkbox, the group row checkboxes and the select all/deselect all API methods act on. Only used with `selectionMode="multi-row"`.

- `'all'` - they act on all the rows in the data (or in the group, for group rows), including the rows that are filtered out. The header and group checkboxes are only checked when all those rows are selected.
- `'visible'` - they act only on the rows that pass the filter. The rows that are filtered out keep their current selection. The header and group checkboxes are checked when all the visible rows are selected.

When no rows are filtered out, both values behave the same.

This applies to flat, grouped and tree data, both with primary keys and with <DPropLink name="useGroupKeysForMultiRowSelection" />. For tree data, it also applies to the parent node checkboxes and to <TreeApiLink name="selectAll" />/<TreeApiLink name="deselectAll" />.

With <DPropLink name="lazyLoad" />, the server applies the target: the <DPropLink name="data" /> function receives `multiRowSelectionTarget` in its <TypeLink name="DataSourceDataParams">parameters</TypeLink>, and it should use it when working out which rows a stored selection covers. Changing this prop doesn't reload the data.

```tsx file="/docs/learn/selection/row-selection-target-example.demo.tsx" title="Choosing which rows the selection acts on when the data is filtered"
```

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

```tsx file="/docs/learn/working-with-data/live-pagination-example.demo.tsx" title="Live pagination - with react-query"
```
</Prop>

<Prop name="onFilterValueChange" type="({field?, id?, filter: {type, operator, value}[]) => void">

> Callback prop called when the <DPropLink name="filterValue" /> changes.

This might not be called immediately, as there might be a <DPropLink name="filterDelay"/> set.

```tsx file="onFilterValueChange-example.demo.tsx" title="Controlled filters with onFilterValueChange"
```

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

<DemoDescription>

Use your mouse to select/deselect cells.

</DemoDescription>

```tsx file="/docs/learn/selection/controlled-cell-selection-example.demo.tsx" height="large" title="Controlled cell selection with onCellSelectionChange"
```

</Prop>

<Prop name="onRowSelectionChange" type="(rowSelection, selectionMode='single-row'|'multi-row') => void">

> A function to be called when the <DPropLink name="rowSelection" /> changes.

<DemoDescription>

Use your mouse or keyboard (press the spacebar) to select/deselect a single row.

</DemoDescription>

```tsx file="/docs/reference/controlled-single-row-selection-example.demo.tsx" title="Controlled row selection with onRowSelectionChange"
```

<DemoDescription>

This example shows how you can use multiple row selection with a predefined controlled value.

Go ahead and select some groups/rows and see the selection value adjust.

The example also shows how you can use the `InfiniteTableApi` to retrieve the actual ids of the selected rows.

</DemoDescription>

```tsx file="/docs/reference/controlled-multi-row-selection-example.demo.tsx" title="Multi row checkbox selection with grouping"
```
</Prop>

<Prop name="onSortInfoChange" type="(sortInfo | null) => void">

> Called when sorting changes on the DataSource.

The sorting can change either via a user interaction or by calling an API method (from the [root API](api) or the [Column API](column-api)).

See related <DataSourcePropLink name="sortInfo" /> for controlled sorting and <DataSourcePropLink name="defaultSortInfo" /> for uncontrolled sorting.

</Prop>

<Prop name="refetchKey" type="string|number|object">

> A value that can be used to trigger a re-fetch of the data.

By updating the value of this prop (eg: you can use it as a counter, and increment it) the `<DataSource />` component reloads it's <DPropLink name="data" /> if it's defined as a function. More specifically, the `data` function is called again and the result will replace the current data.

<DemoTitle>Re-fetching data via refetchKey updates</DemoTitle>
<DemoDescription>

This example shows how you can use the `refetchKey` to trigger reloading the data

</DemoDescription>

```tsx file="refetchKey-example.demo.tsx"
```
 
</Prop>

<Prop name="rowSelection" type="string|number|null|object">

> Describes the selected row(s) in the `DataSource`

For single selection, the prop will be of type: `number | string | null`. Use `null` for empty selection in single selection mode.

For multiple selection, the prop will have the following shape:

```ts file="index.snippet.tsx" region="rowselection"
```

For using group keys in the selection value, see related <DPropLink name="useGroupKeysForMultiRowSelection" />

<DemoDescription>

Use your mouse or keyboard (press the spacebar) to select/deselect a single row.

</DemoDescription>

```tsx file="/docs/reference/controlled-single-row-selection-example.demo.tsx" title="Single row selection (controlled) with onRowSelectionChange"
```

<Note>

When <DPropLink name="lazyLoad" /> is being used - this means not all available groups/rows have actually been loaded yet in the dataset - we need a way to allow you to specify that those possibly unloaded rows/groups are selected or not. In this case, the `rowSelection.selectedRows`/`rowSelection.deselectedRows` arrays should not have row primary keys as strings/numbers, but rather rows/groups specified by their full path (so <DPropLink name="useGroupKeysForMultiRowSelection" /> should be set to `true`).

```ts file="index.snippet.tsx" region="rowselection-2"
```

In the example above, we know that there are 3 groups (`continent`, `country`, `city`), so any item in the array that has a 4th element is a fully specified leaf node. While lazy loading, we need this fully specified path for specific nodes, so we know which group rows to render with indeterminate selection.

</Note>

<Note>

The <DPropLink name="useGroupKeysForMultiRowSelection" /> prop can be used for both lazy and non-lazy `DataSource` components.

</Note>

<DemoDescription>

This example shows how you can use multiple row selection with a predefined controlled value.

Go ahead and select some groups/rows and see the selection value adjust.

The example also shows how you can use the `InfiniteTableApi` to retrieve the actual ids of the selected rows.

</DemoDescription>

```tsx file="/docs/reference/controlled-multi-row-selection-example.demo.tsx" title="Multi row checkbox selection with grouping"
```

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

```tsx file="selectionMode-example.demo.tsx" title="Choose your selection mode between multi cell or multi row"
```

</Prop>

<Prop name="sortFunction" type="(sortInfo:DataSourceSingleSortInfo<T>[], arr: T[]) => T[]">

> Custom sorting function to replace the built-in sorting - `multisort` for flat data, `multisortNested` for tree data.

The function specified in the <DPropLink name="sortFunction" /> prop is called with the <DPropLink name="sortInfo" /> as the first argument and the data array as the second. It should return a sorted array, as per the <DPropLink name="sortInfo" /> it was called with.

<Note>

A `sortFunction` makes the sorting happen in the browser, and it is independent from <DPropLink name="shouldReloadData.sortInfo" />, which only decides if the <DPropLink name="data" /> function is called again when the sorting changes. With both, the data is fetched again on every sort change and then sorted in the browser - `sortFunction={multisort}` is the easiest way to get that.

A `sortFunction` has no effect with <DPropLink name="lazyLoad" /> or <DPropLink name="livePagination" />.

</Note>

<Note>

The `@infinite-table/infinite-react` package exports a `multisort` function - this is the default function used for local sorting of flat data.

```ts file="index.snippet.tsx" region="sortfunction"
```

If you want to implement your own custom sort function, the `multisort` fn is a good starting point you can use.

</Note>

```tsx file="/docs/reference/datasource-props/local-sortFunction-single-sorting-example-with-local-data-example.demo.tsx" title="Using a custom sortFunction"
```

#### Flat data vs tree data: `multisort` and `multisortNested`

- `multisort(sortInfo, array)` sorts a flat array - it's the default for a `DataSource`. It sorts the array in place and returns it.
- `multisortNested(sortInfo, array, { nodesKey, toKey, isLeafNode?, getNodeChildren?, depthFirst?, inplace? })` sorts tree data on every level - it's the default for a `TreeDataSource`. With `inplace: false` (what the `TreeDataSource` uses), the top-level array is copied before sorting, but the sorted children of every parent node are assigned back onto that parent node.

A `sortFunction` is called with the top-level array only, and with no information about the tree. So for tree data, a custom `sortFunction` has to sort the children too - your code knows the `nodesKey` and the primary key, so it can call `multisortNested`:

```tsx file="/docs/reference/datasource-props/tree-sortFunction-multisortNested-example.demo.tsx" title="A custom sortFunction for tree data, using multisortNested"
```

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

```tsx file="/docs/learn/sorting/remote-controlled-multi-sorting-example.demo.tsx" title="Remote + controlled multi sorting"
```

</Prop>



<Prop name="shouldReloadData.sortInfo" type="boolean">

> Specifies if changes in the <DataSourcePropLink name="sortInfo" /> should trigger a reload of the data source - and so, that the data is sorted by whoever provides it.

See related <DataSourcePropLink name="sortInfo" /> and <DataSourcePropLink name="defaultSortInfo" />.

- `false` - the data is sorted locally (in the browser) and the <DPropLink name="data" /> function is not called again. This is the default - for both controlled and uncontrolled sorting - unless <DPropLink name="lazyLoad" /> or <DPropLink name="livePagination" /> is used.
- `true` - the data is sorted by whoever provides it. When <DPropLink name="data" /> is a function, it's called again on every sort change, with the `sortInfo` in its params. When <DPropLink name="data" /> is an array, you pass a new, sorted array (eg from <DataSourcePropLink name="onSortInfoChange" />). The rows are shown in the order they come in - unless a <DPropLink name="sortFunction" /> is specified, in which case they are sorted again in the browser. This is the default with <DPropLink name="lazyLoad" /> and <DPropLink name="livePagination" />.

See [the Sorting page](/docs/learn/sorting/overview) for more details, and [Sorting and filtering the data yourself](/docs/learn/working-with-data/sorting-and-filtering-the-data-yourself).

For configuring the sorting behavior when multiple sorting is enabled, see <PropLink name="multiSortBehavior" />.

</Prop>

<Prop name="shouldReloadData.groupBy" type="boolean">

> Specifies if changes in the <DPropLink name="groupBy" /> should trigger a reload of the data source - applicable when <DPropLink name="data" /> is a function.

- `true` - when <DPropLink name="groupBy" /> changes, the <DPropLink name="data" /> function is called again, with the new `groupBy` in its params. This is the default with <DPropLink name="lazyLoad" />, where the server does the grouping (lazily loaded rows can only be grouped by the server).
- `false` - the <DPropLink name="data" /> function is not called again. This is the default without <DPropLink name="lazyLoad" /> - also with <DPropLink name="livePagination" />, where the loaded pages are grouped in the browser.

Without <DPropLink name="lazyLoad" />, the grouping is always done in the browser - `true` only makes the data reload.

</Prop>

<Prop name="shouldReloadData.pivotBy" type="boolean">

> Specifies if changes in the <DPropLink name="pivotBy" /> should trigger a reload of the data source - applicable when <DPropLink name="data" /> is a function.

- `true` - when <DPropLink name="pivotBy" /> changes, the <DPropLink name="data" /> function is called again, with the new `pivotBy` in its params. This is the default with <DPropLink name="lazyLoad" />, where the server does the pivoting.
- `false` - the <DPropLink name="data" /> function is not called again. This is the default without <DPropLink name="lazyLoad" />.

Without <DPropLink name="lazyLoad" />, the pivoting is always done in the browser - `true` only makes the data reload.

</Prop>

<Prop name="shouldReloadData" type="{ sortInfo, groupBy, filterValue, pivotBy }">

> Specifies which changes in the data-related props should trigger a reload of the data source. Can be a boolean (applies to all of them) or an object.

For sorting and filtering, each one is in one of three states:

- done in the browser - `shouldReloadData.X: false`. The default, for any kind of <DPropLink name="data" />, unless <DPropLink name="lazyLoad" /> or <DPropLink name="livePagination" /> is used.
- reloaded, then done in the browser - `shouldReloadData.X: true`, plus a <DPropLink name="sortFunction" /> or a <DPropLink name="filterFunction" /> (eg `sortFunction={multisort}` or `filterFunction={defaultFilterFunction}`).
- done by whoever provides the data - `shouldReloadData.X: true` and no sort / filter function. The <DPropLink name="data" /> function is called again with the new values in its params (or, for array data, you pass the new data yourself). The default with <DPropLink name="lazyLoad" /> (and, for sorting and filtering, with <DPropLink name="livePagination" />).

Grouping and pivoting are done in the browser, unless <DPropLink name="lazyLoad" /> is used.

The params of the <DPropLink name="data" /> function always include the current `sortInfo` and `filterValue`, even when they don't trigger a reload.

See <DPropLink name="shouldReloadData.sortInfo" />.
See <DPropLink name="shouldReloadData.groupBy" />.
See <DPropLink name="shouldReloadData.filterValue" />.
See <DPropLink name="shouldReloadData.pivotBy" />.

</Prop>

<Prop name="sortTypes" type="Record<string, ((a,b) => number)>">

> Describes the available sorting functions used for local sorting. The object you provide will be merged into the default sort types.

Currently there are two `sortTypes` available:

- `"string"`
- `"number"`
- `"date"`

Those values can be used for the <PropLink name="columns.sortType">column.sortType</PropLink> and <PropLink name="columns.sortType">column.dataType</PropLink> properties.

```ts file="index.snippet.tsx" region="sorttypes"
```

When a column does not explicitly specify the <PropLink name="columns.sortType">column.sortType</PropLink>, the <PropLink name="columns.dataType">column.dataType</PropLink> will be used instead. And if no <PropLink name="columns.dataType">column.dataType</PropLink> is defined, it will default to `string`.

You can add new sort types to the DataSource and InfiniteTable components by specifying this property - the object will be merged into the default sort types.

```tsx file="sortTypes-example.demo.tsx" title="Custom sort by color - magenta will come first"
```

<Note>

In this example, for the `"color"` column, we specified <PropLink name="columns.sortType">column.sortType="color"</PropLink> - we could have passed that as `column.dataType` instead, but if the grid had filtering, it wouldn't know what filters to use for "color" - so we used<PropLink name="columns.sortType">column.sortType</PropLink> to only change how the data is sorted.

</Note>

</Prop>

<Prop name="useGroupKeysForMultiRowSelection" type="boolean" defaultValue={false}>

> Specifies whether <DPropLink name="rowSelection" /> contains group keys or only row ids/primary keys.

When this is `true`, you might want to use the [getSelectedPrimaryKeys](./selection-api#getSelectedPrimaryKeys) method.

When some rows are filtered out, see <DPropLink name="multiRowSelectionTarget" /> for which rows a selected group covers.

<DemoTitle>Multi row checkbox selection using group keys</DemoTitle>
<DemoDescription>

This example shows how you can use have row selection with group keys instead of just the primary keys of rows.

</DemoDescription>

```tsx file="/docs/reference/controlled-multi-row-selection-example-with-group-keys.demo.tsx"
```

</Prop>

</PropTable>
