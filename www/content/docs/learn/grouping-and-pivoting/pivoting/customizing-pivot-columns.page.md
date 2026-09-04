---
title: Customizing Pivot Columns
---

There are a number of ways to customize the generated pivot columns and we'll cover each of them in this page. For a longer walkthrough with live demos, see [customizing generated pivot columns](/blog/2026/09/03/customizing-generated-pivot-columns).

You can pass a column object (or a function that returns one) in three places. Choose the one that matches the scope you want:

1. <PropLink name="pivotColumn" /> on `<InfiniteTable />` — every generated pivot column
2. <DataSourcePropLink name="pivotBy.column" /> — all columns in the group generated for that pivot field
3. <DataSourcePropLink name="aggregationReducers" nocode>aggregationReducers.pivotColumn</DataSourcePropLink> — only columns generated for that aggregation

Those objects have the same shape as a normal <PropLink name="columns">column</PropLink>, so you can set header, size, style, <PropLink name="columns.defaultSortable" nocode>defaultSortable</PropLink>, and so on.

## Global: the `pivotColumn` prop

<PropLink name="pivotColumn" /> is applied to **every** generated pivot column (leaf values and totals). This is the simplest place to turn sorting on, or to set a shared width or header renderer.

```tsx
<InfiniteTable
  pivotColumn={{
    defaultSortable: true,
    defaultWidth: 180,
  }}
/>
```

You can also pass a function when the config should depend on the generated column — for example to make leaf columns sortable but keep totals unsortable:

```tsx
<InfiniteTable
  pivotColumn={({ column }) => ({
    defaultSortable: !column.pivotTotalColumn,
  })}
/>
```

## Per pivot field: `pivotBy.column`

<DataSourcePropLink name="pivotBy.column" /> applies to all pivot columns in the column group generated for that `field`. Use it when only one pivot level should be customized — for example, make every `canDesign` column sortable, without touching the `country` group.

```tsx
const pivotBy: DataSourcePivotBy<Developer>[] = [
  { field: 'country' },
  {
    field: 'canDesign',
    column: {
      defaultSortable: true,
      defaultWidth: 400,
    },
  },
];
```

A function receives the generated column, so you can vary the header (or any other property) per pivot value:

```tsx
const pivotBy: DataSourcePivotBy<Developer>[] = [
  { field: 'country' },
  {
    field: 'canDesign',
    column: ({ column }) => ({
      header: column.pivotGroupKey === 'yes' ? 'Designer' : 'Not a Designer',
    }),
  },
];
```

## Per aggregation: `aggregationReducers.pivotColumn`

Each <DataSourcePropLink name="aggregationReducers">reducer</DataSourcePropLink> can define a `pivotColumn`. That config is applied only to columns generated for **that** aggregation — so you can make `salary` columns sortable and leave a `count` aggregation as it is.

```ts
const aggregationReducers: DataSourceProps<Developer>['aggregationReducers'] = {
  salary: {
    field: 'salary',
    initialValue: 0,
    reducer: (acc, sum) => acc + sum,
    pivotColumn: {
      defaultSortable: true,
    },
  },
  license: {
    field: 'license',
    initialValue: 0,
    reducer: (acc) => acc + 1,
  },
};
```

<DPropLink name="aggregationReducers.pivotColumn" /> on a reducer can also choose which original column to inherit from, or opt out of inheritance entirely — see below.

## Inheriting from initial columns

Pivoting is all about aggregations, so you need to specify the <DataSourcePropLink name="aggregationReducers">reducers</DataSourcePropLink> that will aggregate your data. Each reducer can have a `field` property that specifies the field that will be used for aggregation.

If the table <PropLink name="columns"/> collection already has a column bound to the `field` used in the aggregation, the column configuration will be inherited by the generated pivot column. Override that with <DPropLink name="aggregationReducers.pivotColumn.inheritFromColumn" /> — pass another column id to inherit from that column instead, or `false` to inherit from none. See the <DPropLink name="aggregationReducers.pivotColumn" /> reference for the full column config you can set on the reducer.

```ts
const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: {
    field: 'preferredLanguage',
    style: { color: 'blue' },
  },
  age: {
    field: 'age',
    style: {
      color: 'magenta',
      background: 'yellow',
    },
  },
  salary: {
    field: 'salary',
    type: 'number',
    style: {
      color: 'red',
    },
  },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  id: { field: 'id' },
};

const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
  initialValue: 0,
  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => {
    return Math.floor(arr.length ? sum / arr.length : 0);
  },
};

const aggregationReducers: DataSourceProps<Developer>['aggregationReducers'] = {
  // will have the same configuration as the `salary` column
  avgSalary: { field: 'salary', ...avgReducer },
  avgAge: {
    field: 'age',
    ...avgReducer,
    pivotColumn: {
      // will have the same configuration as the `preferredLanguage` column
      inheritFromColumn: 'preferredLanguage',
      // but specify a custom default width
      defaultWidth: 500,
    },
  },
};
```

<Sandpack title="Pivot columns inherit from original columns bound to the same field">

```ts file="pivot-column-inherit-example.page.tsx"

```

</Sandpack>
