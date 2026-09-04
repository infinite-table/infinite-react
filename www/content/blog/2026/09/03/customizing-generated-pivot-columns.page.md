---
title: Customizing generated pivot columns in a React DataGrid
description: Control headers, sorting, width, and inherited styles on Infinite Table pivot columns with three override layers — and inheritFromColumn when the default field match is not enough.
date: 2026-09-03
author: radu
tags: pivoting, grouping, customizing
---

Generated pivot columns are the point of pivoting. You describe your grouping, your pivot columns and your aggregations and Infinite Table builds the report surface from the values in the data.

That first render is rarely the last one you want. Headers are generated based on values and will probably need customization, numbers are unformatted, styling is absent. The [pivoting overview](/docs/learn/grouping-and-pivoting/pivoting/overview) and the earlier post on [building pivoted DataGrids](/blog/2026/07/10/building-pivoted-react-datagrids-with-generated-columns) cover how columns get generated. This article is about making those columns look and behave like the rest of your grid.

You do not customize each generated id by hand. You describe overrides at three scopes, and you inherit from the columns you already defined.

## Three scopes, same column shape

Pass a column object — or a function that returns one — in one of these places:

1. <PropLink name="pivotColumn" /> on `<InfiniteTable />` — every generated pivot column
2. <DataSourcePropLink name="pivotBy.column" /> — all columns in the group generated for that pivot field
3. <DataSourcePropLink name="aggregationReducers.pivotColumn" /> — only columns generated for that aggregation

The object has the same shape as a normal <PropLink name="columns">column</PropLink>. Header, width, `style`, <PropLink name="columns.defaultSortable" nocode>defaultSortable</PropLink>, `renderValue` — anything you would set on a regular column.

Pick the layer that matches the question:

- “Make every pivot column sortable” → <PropLink name="pivotColumn" />
- “Rewrite the `canDesign` headers, leave `country` alone” → <DataSourcePropLink name="pivotBy.column" />
- “Salary columns should be sortable and red; the count aggregation stays as-is” → <DataSourcePropLink name="aggregationReducers.pivotColumn" />

If the same property is set in more than one place, <PropLink name="pivotColumn" /> is applied last. <DataSourcePropLink name="aggregationReducers.pivotColumn" /> wins over <DataSourcePropLink name="pivotBy.column" />. Inherited source-column props are the baseline — any explicit override wins.

## Global defaults: width and sorting

<PropLink name="pivotColumn" /> is the simplest layer. Generated pivot columns set <PropLink name="columns.defaultSortable" nocode>defaultSortable</PropLink> to `false`, so <PropLink name="columnDefaultSortable" /> does not turn sorting on. Put `defaultSortable: true` on <PropLink name="pivotColumn" /> instead.

```tsx
<InfiniteTable
  pivotColumn={{
    defaultSortable: true,
    defaultWidth: 180,
  }}
/>
```

That applies to leaf columns and totals. When totals should stay unsortable, pass a function. The generated column includes `pivotTotalColumn`:

```tsx
<InfiniteTable
  pivotColumn={({ column }) => ({
    defaultSortable: !column.pivotTotalColumn,
  })}
/>
```

The sort type is taken from the original <PropLink name="columns" /> bound to the aggregation `field` — not the column id. A column defined as `stargazers: { field: 'stargazers_count', type: 'number' }` is enough for numeric sorting on the generated `stargazers_count:true` column.

<Sandpack title="Sortable generated pivot columns" size="md" viewMode="preview">

<Description>

The table starts sorted by the group column. `pivotColumn={{ defaultSortable: true }}` makes every generated pivot column sortable. Click a country / designer header to add a sort by that aggregated value.

</Description>

```tsx live file="$DOCS/learn/grouping-and-pivoting/pivoting/pivoting-sorting-example.page.tsx"

```

</Sandpack>

## Per pivot field: headers people recognize

Raw pivot keys rarely belong in a header. Inventory statuses (`in_stock`, `reserved`), booleans (`yes` / `no`), and channel codes all need labels.

<DataSourcePropLink name="pivotBy.column" /> as an object applies to every column in that field's group:

```tsx
const pivotBy = [
  { field: 'country' },
  {
    field: 'canDesign',
    column: {
      defaultWidth: 160,
    },
  },
];
```

As a function, it receives the generated column, so you can vary the header per value. `column.pivotGroupKey` is the key at that pivot level:

```tsx
const pivotBy = [
  { field: 'country' },
  {
    field: 'canDesign',
    column: ({ column }) => ({
      header: column.pivotGroupKey === 'yes' ? 'Designer' : 'Non-designer',
    }),
  },
];
```

<Sandpack title="Custom headers on generated pivot columns" size="md" viewMode="preview">

<Description>

The `canDesign` pivot values are rewritten to Designer / Non-designer. Country groups stay as they are.

</Description>

```tsx live file="$DOCS/learn/grouping-and-pivoting/pivoting/pivoting-customize-column-example.page.tsx"

```

</Sandpack>

The same callback is where you would map warehouse statuses to “Available” / “Reserved” / “Quarantine”, or support channels to the names operators already use. New warehouses or channels still become new columns — only the label changes.

## Per aggregation: configure one measure

When the grid shows more than one aggregation, you usually do not want the same config on every generated column. A salary average should look like a number column. A ticket-count aggregation should not inherit currency formatting.

Each reducer can define <DataSourcePropLink name="aggregationReducers.pivotColumn" />. That object applies only to columns generated for **that** aggregation.

```ts
const aggregationReducers = {
  salary: {
    field: 'salary',
    initialValue: 0,
    reducer: (acc, value) => acc + value,
    pivotColumn: {
      defaultSortable: true,
      type: 'number',
    },
  },
  license: {
    field: 'license',
    initialValue: 0,
    reducer: (acc) => acc + 1,
  },
};
```

Only the `salary` pivot columns become sortable. The `license` count columns stay with the generated defaults.

This is also the right place to set a reducer-specific `header`, `defaultWidth`, or `style` when you have several measures under the same pivot group (for example salary and headcount under each country).

## Inherit from the columns you already wrote

Pivoting is aggregations. Each reducer usually has a `field`. If `<InfiniteTable />` already has a column bound to that same `field`, the generated pivot column inherits that column's configuration — `type`, `style`, `header`, `renderValue`, default width.

```ts
const columns = {
  salary: {
    field: 'salary',
    type: 'number',
    style: { color: 'red' },
  },
};

const aggregationReducers = {
  avgSalary: {
    field: 'salary',
    reducer: 'avg',
  },
};
```

You do not re-declare number formatting for every generated `United States / yes` salary column. Inheritance looks up the original column by **field**, not by column id, so this also works:

```ts
const columns = {
  stargazers: {
    field: 'stargazers_count',
    type: 'number',
  },
};
```

Override the default with <DataSourcePropLink name="aggregationReducers.pivotColumn.inheritFromColumn" />:

- a `string` — inherit from that column id instead
- `false` — inherit from none
- `true` or omitted — inherit from the column bound to the aggregator's `field` (the default)

```ts
const aggregationReducers = {
  avgSalary: { field: 'salary', ...avgReducer },
  avgAge: {
    field: 'age',
    ...avgReducer,
    pivotColumn: {
      inheritFromColumn: 'preferredLanguage',
      defaultWidth: 500,
    },
  },
};
```

`avgAge` still aggregates `age`, but the generated columns pick up the `preferredLanguage` column config, then apply `defaultWidth: 500` on top.

<Sandpack title="Pivot columns inherit from original columns" size="md" viewMode="preview">

<Description>

`avgSalary` inherits the red number styling from the `salary` column. `avgAge` inherits from `firstName` via `inheritFromColumn` and uses a wider default width.

</Description>

```tsx live file="$DOCS/learn/grouping-and-pivoting/pivoting/pivot-column-inherit-example.page.tsx"

```

</Sandpack>

Use `inheritFromColumn: false` when the source column's `renderValue` or `style` would be wrong on an aggregated cell — for example a name renderer on a numeric average.

## Combining layers

A typical analytics grid uses more than one layer:

```tsx
const pivotBy = [
  { field: 'country' },
  {
    field: 'canDesign',
    column: ({ column }) => ({
      header: column.pivotGroupKey === 'yes' ? 'Designer' : 'Non-designer',
    }),
  },
];

const aggregationReducers = {
  salary: {
    field: 'salary',
    reducer: 'avg',
    pivotColumn: {
      defaultSortable: true,
    },
  },
  headcount: {
    initialValue: 0,
    reducer: (acc) => acc + 1,
    pivotColumn: {
      inheritFromColumn: false,
      header: 'Count',
    },
  },
};

<InfiniteTable
  pivotColumn={{
    defaultWidth: 140,
  }}
/>
```

Shared width comes from <PropLink name="pivotColumn" />. Designer labels come from <DataSourcePropLink name="pivotBy.column" />. Only salary columns are sortable; headcount opts out of inheritance so it does not pick up salary formatting.

That is the whole customization model: generate columns from data, inherit what you already configured, then override at the scope that matches the change.

## Go deeper in the docs

- [Customizing pivot columns](/docs/learn/grouping-and-pivoting/pivoting/customizing-pivot-columns) — the three override points and inheritance, with reference links
- [Pivoting overview](/docs/learn/grouping-and-pivoting/pivoting/overview) — `pivotBy` setup, totals, and sorting the group column
- <DataSourcePropLink name="aggregationReducers.pivotColumn" /> and <DataSourcePropLink name="aggregationReducers.pivotColumn.inheritFromColumn" /> — DataSource prop reference
- [Building pivoted React DataGrids with generated columns](/blog/2026/07/10/building-pivoted-react-datagrids-with-generated-columns) — product scenarios and server-side pivoting
