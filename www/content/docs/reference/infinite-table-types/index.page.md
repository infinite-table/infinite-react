---
title: Infinite Table Types
description: TypeScript type definitions for Infinite Table
---

These are types related to the `InfiniteTable` component, that you can import with named imports from the `@infinite-table/infinite-react` package.

Additionally, there are other exported types, for example, related to the [DataSource component](/docs/reference/data-source-types)


```tsx title="Importing the type for rowInfo"

import { InfiniteTableRowInfo } from '@infinite-table/infinite-react'

```
<PropTable>

<Prop name="InfiniteTableRowInfo">

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
