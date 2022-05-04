---
title: Using Rows at Runtime
---

At runtime, the <PropLink name="columns.render" /> function and a <PropLink name="rowStyle">lot</PropLink> <PropLink name="rowClassName">of</PropLink> <PropLink name="columns.style">other</PropLink> functions use the `rowInfo` object to access the current row and use it to decide how to render the current cell or row.

The `rowInfo` object has a few variations, depending on the presence or absence of grouping

<Note>

All those variations are discriminated in the `TypeScript` typings, so you can easily use the different types of `rowInfo` objects.

</Note>

## Ungrouped Scenario - normal `rowInfo`

When there is no <DataSourcePropLink name="groupBy">grouping</DataSourcePropLink>, the `rowInfo` object has the following properties:

 * `data` - type: `DATA_TYPE`
 * `dataSourceHasGrouping` - type: `false`
 * `isGroupRow` - type: `false`
 * `id` - type: `any`. The id of the row, as defined by the <DataSourcePropLink name="idProperty" /> prop.
 * `selfLoaded` - type: `boolean`. Useful in lazy-loading scenarios, when there is batching present. If you're not in such a scenario, the value will be `false`.
 * `indexInAll` - type `number`. The index of the row in the full dataset. Called like this because for grouping scenarios, there's also an `indexInGroup`


### Discriminator
```ts
rowInfo.dataSourceHasGrouping === false
```

## Grouped scenario - normal `rowInfo`

When there is <DataSourcePropLink name="groupBy">grouping</DataSourcePropLink> defined, and the row is not a group row, the `rowInfo` object has the following properties:

* `data` - type: `DATA_TYPE`
* `dataSourceHasGrouping` - type: `true`
* `isGroupRow` - type: `false`
* `indexInAll` - like the above
* `indexInGroup` - type: `number`. The index of the row in the its parent group.
* `groupKeys` - type: `any[]`, but usually it's actually `string[]`. For normal rows, the group keys will have all the keys starting from the topmost parent down to the last group row in the hierarchy (the direct parent of the current row).
   
```txt
Example: People grouped by country and city

> Italy  - country         - groupKeys: ['Italy']
  > Rome - city           - groupKeys: ['Italy', 'Rome']
     - Marco    - person   - groupKeys: ['Italy', 'Rome']
     - Luca     - person   - groupKeys: ['Italy', 'Rome']
     - Giuseppe  - person  - groupKeys: ['Italy', 'Rome']
```

* `groupBy` - type `(keyof T)[]`. Has the same structure as groupKeys, but it will contain the fields used to group the rows.
* `rootGroupBy` - type `(keyof T)[]`. The groupBy value of the DataSource component, mapped to the `groupBy.field`
* `parents` - a list of `rowInfo` objects that are the parents of the current row.
* `indexInParentGroups[]` - type: `number[]`. See below for an example

```
> Italy  - country         - indexInParentGroups: [0]
  > Rome - city           - indexInParentGroups: [0,0]
    - Marco    - person   - indexInParentGroups: [0,0,0]
    - Luca     - person   - indexInParentGroups: [0,0,1]
    - Giuseppe  - person  - indexInParentGroups: [0,0,2]
> USA - country            - indexInParentGroups: [1]
  > LA - city             - indexInParentGroups: [1,0]
    - Bob  - person       - indexInParentGroups: [1,0,2]
```

* `groupCount` - type: `number`. The count of leaf rows that the current group (in this case, the parent group) contains
* `groupNesting` - type `number`. The nesting of the parent group.
* `collapsed` - type `boolean`.
* `selfLoaded` - type: `boolean`. Useful in lazy-loading scenarios, when there is batching present. If you're not in such a scenario, the value will be `false`.


### Discriminator

```ts
rowInfo.dataSourceHasGrouping === true && rowInfo.isGroupRow === false
```

## Grouped scenario - group `rowInfo`

When there is <DataSourcePropLink name="groupBy">grouping</DataSourcePropLink> defined, and the row is a group row, the `rowInfo` object has the following properties:

* `data` - type: `Partial<DATA_TYPE> | null`. The `data` object that might be available is the result of the <DataSourcePropLink name="aggregationReducers">aggregation reducers</DataSourcePropLink>. If none are specified, `data` will be `null`
* `dataSourceHasGrouping` - type: `true`
* `isGroupRow` - type: `true`
* `indexInAll` - like the above
* `indexInGroup` - type: `number`. The index of the row in the its parent group.
* `deepRowInfoArray` - an array of `rowInfo` objects. This array contains all the (uncollapsed, so visible) row infos under this group, at any level of nesting, in the order in which they are visible in the table.
* `reducerResults` - type `Record<string, AggregationReducerResult>`. The result of the <DataSourcePropLink name="aggregationReducers">aggregation reducers</DataSourcePropLink> for each field in the <DataSourcePropLink name="aggregationReducers" /> prop.
* `groupCount` - type: `number`. The count of leaf rows that the current group (in this case, the parent group) contains
* `groupData` - type: `DATA_TYPE[]`. The array of the data of all leaf nodes (normal nodes) that are inside this group.
   
```txt
Example: People grouped by country and city

> Italy  - country         - groupKeys: ['Italy']
  > Rome - city           - groupKeys: ['Italy', 'Rome']
     - Marco    - person   - groupKeys: ['Italy', 'Rome']
     - Luca     - person   - groupKeys: ['Italy', 'Rome']
     - Giuseppe  - person  - groupKeys: ['Italy', 'Rome']
```
* `collapsedChildrenCount` - type: `number`. The count of all leaf nodes (normal rows) inside the group that are not being visible due to collapsing (either the current row is collapsed or any of its children)
* `directChildrenCount` - type: `number`. The count of the direct children of the current group. Direct children can be either normal rows or groups.
* `directChildrenLoadedCount` - type: `number`. Like `directChildrenCount`, but only counts the rows that are loaded (when batched lazy loading is configured).
* `childrenAvailable` - type: `boolean`. For lazy/batched grouping, this is true if the group has been expanded at least once. NOTE: if this is true, it doesn't mean that all the children have been loaded, it only means that at least some children have been loaded and are available. Use `directChildrenCount` and `directChildrenLoadedCount` to know if all the children have been loaded or not.
* `childrenLoading` - type: `boolean`. Boolean flag that will be true while lazy loading direct children of the current row group. Use `directChildrenLoadedCount` and `directChildrenCount` to know if all the children have been loaded or not.
* `groupKeys` - type: `any[]`, but usually it's actually `string[]`. For group rows, the group keys will have all the keys starting from the topmost parent down to the current group row (key for current group row is included).
* `groupBy` - type `(keyof T)[]`. Has the same structure as groupKeys, but it will contain the fields used to group the rows.
* `rootGroupBy` - type `(keyof T)[]`. The groupBy value of the DataSource component, mapped to the `groupBy.field`
* `groupCount` - type: `number`. The count of leaf rows that the current group (in this case, the parent group) contains
* `groupNesting` - type `number`. The nesting of the parent group.
* `parents` - a list of `rowInfo` objects that are the parents of the current row.
* `indexInParentGroups[]` - type: `number[]`. See below for an example

```
> Italy  - country         - indexInParentGroups: [0]
  > Rome - city           - indexInParentGroups: [0,0]
    - Marco    - person   - indexInParentGroups: [0,0,0]
    - Luca     - person   - indexInParentGroups: [0,0,1]
    - Giuseppe  - person  - indexInParentGroups: [0,0,2]
> USA - country            - indexInParentGroups: [1]
  > LA - city             - indexInParentGroups: [1,0]
    - Bob  - person       - indexInParentGroups: [1,0,2]
```

* `collapsed` - type `boolean`.
* `selfLoaded` - type: `boolean`. Useful in lazy-loading scenarios, when there is batching present. If you're not in such a scenario, the value will be `false`.


### Discriminator

```ts
rowInfo.dataSourceHasGrouping === true && rowInfo.isGroupRow === true
```
