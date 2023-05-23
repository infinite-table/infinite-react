---
title: Infinite Table Type Definitions
description: TypeScript type definitions for Infinite Table
---



These are the public type definitions for `InfiniteTable` and related components, that you can import with named imports from the `@infinite-table/infinite-react` package.


```tsx title="Importing the type for rowInfo"

import type { InfiniteTableRowInfo } from '@infinite-table/infinite-react'

```


<Note title="Naming convention ⚠️">

The types of all properties in the `InfiniteTable` and `DataSource` components respect the following naming convention: `<ComponentName>Prop<PropName>`

So, for example, the type for <DPropLink name="groupBy" /> is <TypeLink name="DataSourcePropGroupBy" />

</Note>


<PropTable searchPlaceholder="Type to filter type definitions">

<Prop name="DataSourceSingleSortInfo" generic>

> Represents information on a specific sort. Contains info about the field to sort by, the sort direction, and the sort type.

This is the referenced by the <DPropLink name="sortInfo" /> prop.

Basically the <DPropLink name="sortInfo" /> prop can be either an array of <TypeLink name="DataSourceSingleSortInfo" /> objects, or a single <TypeLink name="DataSourceSingleSortInfo" /> object (or null).

These are the type properties:

 - `dir`: `1 | -1` - 1 means ascending sort order; -1 means descending sort order.
 - `field?`: `keyof DATA_TYPE` - the field to sort by.
 - `id?`: `string` - an id for the sort info. When a column is not bound to a `field`, use the column id as the `id` property of the sort info, if you need to specify a default sort order by that column. Note that columns have a <PropLink name="columns.valueGetter">valueGetter</PropLink>, which will be used when doing local sorting and the column is not bound to an exact field.
 - `type?`: `string` - the sort type to apply. See <DPropLink name="sortType" /> for more details. For example, you can use `"string"` or `"number"` or `"date"`


</Prop>

<Prop name="DataSourcePropSortInfo" generic>

> The type of the <DPropLink name="sortInfo" /> DataSource prop.

Valid types for this prop are: 
 * `null`
 * <TypeLink name="DataSourceSingleSortInfo" />
 * <TypeLink name="DataSourceSingleSortInfo" />[]

</Prop>

<Prop name="DataSourcePropGroupBy" generic>

> The type of the <DPropLink name="groupBy" /> prop. Basically this type is an array of <TypeLink name="DataSourceGroupBy" />.

</Prop>

<Prop name="DataSourceGroupBy" generic>

> The type for the objects in the <DPropLink name="groupBy" /> array. See related <TypeLink name="DataSourcePropGroupBy" />

<Note>

The type is generic, and the generic type parameter is the type of the data in the grid. In this documentation, either `DATA_TYPE` or `T` will be used to refer to the generic type parameter.

</Note>

These are the type properties:
- `field` - `keyof DATA_TYPE`. The field to group by.
- `column`: `Partial<InfiniteTableColumn>`
- `toKey?`: `(value: any, data: DATA_TYPE) => any` - a function that can be used to decide the bucket where each data object from the data set will be placed. If not provided, the `field` value will be used.

</Prop>

<Prop name="InfiniteTableRowInfo" generic>

> Type for `rowInfo` object representing rows in the table. See [Using RowInfo](/docs/learn/rows/using-row-info) for more details.

<Note>

The type is generic, and the generic type parameter is the type of the data in the grid. In this documentation, either `DATA_TYPE` or `T` will be used to refer to the generic type parameter.

</Note>

Many methods in Infinite Table are called with `rowInfo` objects that are typed to <TypeLink name="InfiniteTableRowInfo" />. (see <PropLink name="columns.style" />, <PropLink name="rowStyle" />, <PropLink name="rowClassName" />, <PropLink name="persistEdit" />, <PropLink name="onEditAccepted" /> and many others)

This is a discriminated type, based on the `dataSourceHasGrouping` boolean property and the `isGroupRow` boolean property. This means that the type of the object will change based on the value of those properties.

```ts

export type InfiniteTableRowInfo<T> =
  // dataSourceHasGrouping = false, isGroupRow = false
  | InfiniteTable_NoGrouping_RowInfoNormal<T>; 

  // dataSourceHasGrouping = true, isGroupRow = false
  | InfiniteTable_HasGrouping_RowInfoNormal<T> 

   // dataSourceHasGrouping = true, isGroupRow = true
  | InfiniteTable_HasGrouping_RowInfoGroup<T>
```

The common properties of the type (in all discriminated cases) are:

* `id` - the primary key of the row, as retrieved using the <DPropLink name="idProperty" /> prop.
* `indexInAll` - the index in all currently visible rows.
* `rowSelected` - whether the row is selected or not - `boolean | null`.


### InfiniteTable_NoGrouping_RowInfoNormal

This type has `dataSourceHasGrouping` set to `false` and `isGroupRow` set to `false`.

Additional properties to the ones already mentioned above:

 * `data` - the data for the underlying row, of type `DATA_TYPE`.
 * `isGroupRow` - `false`
 * `dataSourceHasGrouping` - `false`
 * `selfLoaded` - `boolean` - useful when lazy loading is configured.


### InfiniteTable_HasGrouping_RowInfoNormal

This type has `dataSourceHasGrouping` set to `true` and `isGroupRow` set to `false`. So we're in a scenario where grouping is configured via <DPropLink name="groupBy" />, but the current row is not a group row.

Additional properties this type exposes:

 * `data` - the data for the underlying row, of type `DATA_TYPE`.
 * `dataSourceHasGrouping` - `true`
 * `isGroupRow` - `false`
 * `indexInGroup` - type: `number`. The index of the row in its parent group.
 * `groupKeys` - type: `any[]`, but usually it's actually `string[]`. For normal rows, the group keys will have all the keys starting from the topmost parent down to the last group row in the hierarchy (the direct parent of the current row).
 * `groupBy` - type `(keyof T)[]`. Has the same structure as groupKeys, but it will contain the fields used to group the rows.
 * `rootGroupBy` - type `(keyof T)[]`. The groupBy value of the DataSource component, mapped to the `groupBy.field`
 * `parents` - a list of `rowInfo` objects that are the parents of the current row.
 * `indexInParentGroups[]` - type: `number[]`. See below for an example
 * `groupCount` - type: `number`. The count of leaf rows that the current group (in this case, the parent group) contains
 * `groupNesting` - type `number`. The nesting of the parent group.
 * `collapsed` - type `boolean`.
 * `selfLoaded` - type: `boolean`. Useful in lazy-loading scenarios, when there is batching present. If you're not in such a scenario, the value will be `false`.

### InfiniteTable_HasGrouping_RowInfoGroup

This type has `dataSourceHasGrouping` set to `true` and `isGroupRow` set to `true`. So we're in a scenario where grouping is configured via <DPropLink name="groupBy" /> and the current row is a group row.

Additional properties this type exposes:

 * `data` - the data for the underlying row, of type `Partial<DATA_TYPE> | null`. If there are [aggregations configured](/docs/learn/grouping-and-pivoting/group-aggregations), then `data` will be an object that contains those aggregated values (so the shape of the object will be `Partial<DATA_TYPE>`). When no aggregations, `data` will be `null`
 * `dataSourceHasGrouping` - `true`
 * `isGroupRow` - `false`
 * `error` - type: `string?`. If there was an error while loading the group (when the group row is expanded), this will contain the error message. If the group row was loaded with the `cache: true` flag sent in the server response, the error will remain on the `rowInfo` object even when you collapse the group row, otherwise, if `cache: true` was not present, the `error` property will be removed on collapse.
 * `indexInGroup` - type: `number`. The index of the row in the its parent group.
 * `deepRowInfoArray` - an array of `rowInfo` objects. This array contains all the (uncollapsed, so visible) row infos under this group, at any level of nesting, in the order in which they are visible in the table.
 * `reducerResults` - type `Record<string, AggregationReducerResult>`. The result of the <DataSourcePropLink name="aggregationReducers">aggregation reducers</DataSourcePropLink> for each field in the <DataSourcePropLink name="aggregationReducers" /> prop.
 * `groupCount` - type: `number`. The count of leaf rows that the current group (in this case, the parent group) contains
 * `groupData` - type: `DATA_TYPE[]`. The array of the data of all leaf nodes (normal nodes) that are inside this group.

</Prop>

</PropTable>
