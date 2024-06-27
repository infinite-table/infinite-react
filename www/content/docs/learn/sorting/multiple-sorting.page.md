---
title: Multiple Sorting
description: Docs and examples on applying multiple sorting to the DataSource for Infinite Table DataGrid
---

By default, if you don't specify otherwise, the DataGrid is configured with single sorting. For multiple sorting, you need to specify the sorting information as an array:

```tsx
<DataSource<Developer>
  primaryKey="id"
  data={data}
  // we want an array here
  defaultSortInfo={[]}
>
  <InfiniteTable<Developer> columns={columns} />
</DataSource>
```

<Note>

An empty array means no sorting. However, it does specify that sorting is configured as multiple sorting, so it's useful to set it to `[]`

</Note>

<Sandpack title="Configuring multiple sorting with uncontrolled behavior">

<Description>

Try clicking the `age` column and then the `firstName` column.

If the multi-sort behavior is `replace`, clicking the second column will remove the sort from the first column.
In order for the sorting to be additive, even if the behavior is `replace`, use the `Ctrl`/`Cmd` key while clicking the column header.

If the multi-sort behavior is `append`, clicking the second column will add it to the sort.

</Description>

```ts file="local-multi-sorting-example-defaults-with-local-data.page.tsx"

```

</Sandpack>

## User interaction and multi sort behavior

When `InfiniteTable` is configured with multiple sorting there are two supported behaviors:

- `append` - when this behavior is used, clicking a column header adds that column to the alredy existing sort. If the column is already sorted, the sort direction is reversed. In order to remove a column from the sort, the user needs to click the column header in order to toggle sorting from ascending to descending and then to no sorting.
- `replace` - the default behavior - a user clicking a column header removes any existing sorting and sets that column as sorted. In order to add a new column to the sort, the user needs to hold the `Ctrl/Cmd` key while clicking the column header.

<Note>

The behavior of multiple sorting is configured via the <PropLink name="multiSortBehavior" /> - the default value for this prop is `"replace"`.

❗️❗️❗️ The <PropLink name="multiSortBehavior" /> prop is defined on the `InfiniteTable` component, not on the `DataSource` component - as it's the `InfiniteTable` that handles user interaction, even though the `DataSource` does the actual sorting.

</Note>

### Multi sort behavior - `append`

#### Scenario 1

- user clicks a column header to sort by that column - an ascending sort is added, and the column header will contain the sort index - `1`
- if user clicks the same column, the sort direction is reversed - sort index is preserved as `1`, but descending order is set.
- user clicks the same column again - the column is removed from the sort.

#### Scenario 2

- user clicks a column header to sort by that column - an ascending sort is added, and the column header will contain the sort index - `1`
- user clicks another column - the new column is added to the sort, with ascending order and sort index `2`. The initial clicked column is still the sorted, and that sort is applied first. For equal values on column `1`, the sort by column `2` is applied.
- user clicks column `2` again - the sort direction is reversed for the second column. So now the sort order is `1` ascending, `2` descending.
- user clicks column `2` again - the column is removed from the sort. The sorting now only contains the first column, in ascending order.

### Multi sort behavior - `replace`

<Note>

This is the <PropLink code={false} name="multiSortBehavior">default behavior</PropLink> for multiple sorting.
</Note>

In the `replace` behavior, clicking a column header will remove any existing sorting and set that specific column as sorted.

In order to add a new column to the sort, the user needs to hold the `Ctrl`/`Cmd` key while clicking a column header. Holding the `Ctrl`/`Cmd` key while clicking a column header results in the same behavior as the `append`.

## Controlled and uncontrolled sorting

As noted above, for multiple sorting, you need to specify an array of objects - see <TypeLink name="DataSourceSingleSortInfo" /> for more on the shape of those objects:

```ts
// sort by age in descending order, then by `firstName` in ascending order
sortInfo = [
  { field: 'age', type: 'number', dir: -1 },
  { field: 'firstName', dir: 1 },
];

// no sorting
sortInfo = [];
```

The simplest way to use multiple sorting is via the uncontrolled <DPropLink name="defaultSortInfo" /> prop. Specify an empty array as the default value, and multiple sorting will be enabled.

This allows sorting by multiple fields (to which columns are bound) - you can specify however many you want - so when sorting two objects in the `DataSource`, the first `sortInfo` is used to compare the two, and then, on equal values, the next `sortInfo` is used and so on.

<Note>

If you want to change the sorting from code, after the component is mounted, you need to use the controlled <DPropLink name="sortInfo" /> prop.

In this case, make sure you update the <DPropLink name="sortInfo" /> prop as a result of user interaction, by using the <DPropLink name="onSortInfoChange" /> callback.

</Note>

<Sandpack title="Local + uncontrolled multi-sorting example">

<Description>

This table allows sorting multiple columns - initially the `country` column is sorted in descending order and the `salary` column is sorted in ascending order. `Ctrl`/`Cmd` + click the `salary` column to toggle the column sort to descending. `Ctrl`/`Cmd` clicking it a second time will remove it from the sort altogether.

</Description>

```ts file="local-uncontrolled-multi-sorting-example-with-remote-data.page.tsx"

```

</Sandpack>

<Sandpack title="Remote + uncontrolled multi-sorting example">

```ts file="remote-uncontrolled-multi-sorting-example.page.tsx"

```

</Sandpack>

<Note>

If you use uncontrolled sorting via <DataSourcePropLink name="defaultSortInfo" /> there's no way to switch between single and multiple sorting after the component is mounted. If you have this use-case, you need to use the controlled <DataSourcePropLink name="sortInfo" /> prop.

</Note>

## Remote Sorting

Sorting remotely makes a lot of sense when using a function as your <DataSourcePropLink name="data" /> source. Whenever the sort information is changed, the function will be called with all the information needed to retrieve the data from the remote endpoint.

<Note>

For remote sorting, make sure you specify <DataSourcePropLink name="shouldReloadData.sortInfo">shouldReloadData.sortInfo=true</DataSourcePropLink> - if you don't, the data will also be sorted locally in the browser (which most of the times will be harmless, but it means wasted CPU cycles).

</Note>

<Sandpack title="Remote + controlled multi-sorting example">

```ts file="remote-controlled-multi-sorting-example.page.tsx"

```

</Sandpack>

In the example above, remote and controlled sorting are combined - because `shouldReloadData.sortInfo=true` is specified, the `<DataSource />` will call the `data` function whenever sorting changes, and will pass in the `dataParams` object that contains the sort information.
