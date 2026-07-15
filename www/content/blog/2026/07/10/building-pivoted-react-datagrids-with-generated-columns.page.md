---
title: Building pivoted React DataGrids with generated columns
description: Turn grouped data into cross-tab reports with Infinite Table pivoting, generated columns, custom pivot headers, and total columns.
date: 2026-07-10
author: radu
tags: pivoting, grouping, analytics
---

Pivot tables are one of those features that start as a reporting request and quickly become a UI architecture problem.

You need to group rows, aggregate values, create columns from data values, keep those columns typed, and still leave enough room to customize headers, widths, formatting, totals, and server-side loading. Infinite Table's pivoting feature keeps that work inside the `DataSource` pipeline so your React grid can render a report-style layout without hardcoding every possible result column.

The docs cover this in the [pivoting guide](/docs/learn/grouping-and-pivoting/pivoting/overview). This article walks through the key idea: define pivoting at the data level, then render the generated columns in `<InfiniteTable />`.

## Pivoting belongs in the DataSource

In Infinite Table, the `DataSource` owns grouping, pivoting, and aggregation because those features all reshape the data before the grid renders it.

```tsx
const groupBy = [{ field: 'department' }, { field: 'country' }];
const pivotBy = [{ field: 'team' }];

<DataSource<Developer>
  groupBy={groupBy}
  pivotBy={pivotBy}
  aggregationReducers={aggregationReducers}
>
  {({ pivotColumns, pivotColumnGroups }) => {
    return (
      <InfiniteTable<Developer>
        columns={columns}
        pivotColumns={pivotColumns}
        pivotColumnGroups={pivotColumnGroups}
      />
    );
  }}
</DataSource>;
```

The `children` render prop of the `DataSource` is an important handoff in the Pivot DataGrid. The `DataSource` looks at the configured <DataSourcePropLink name="pivotBy" /> and <DataSourcePropLink name="aggregationReducers" />, does all the data grouping and computations and then gives the table the generated `pivotColumns` and `pivotColumnGroups`.

Without that split, you would have to scan the dataset yourself, discover every pivot value, construct matching columns, wire column groups, and keep the result in sync as grouping or pivoting changes.

## A practical example: grouping by role, pivoting by geography

Imagine a developers analytics grid where rows are grouped by `preferredLanguage` and `stack`, then pivoted by `country` and whether a developer can design. Instead of showing one salary column, the grid can show aggregated salary columns for each country/design combination.

The docs example below does exactly that. It groups developers, pivots the salary aggregation into generated columns, and starts with all groups collapsed so the cross-tab shape is easy to scan.

<Sandpack title="Pivoting with generated columns" size="md" viewMode="preview">

<Description>

You can find this demo in our [pivoting docs](/docs/learn/grouping-and-pivoting/pivoting/overview). Expand a group to see the aggregated salary values distributed across generated pivot columns.

</Description>

```tsx live file="$DOCS/learn/grouping-and-pivoting/pivoting/pivoting-example.page.tsx"

```

</Sandpack>

## Generated does not mean generic

Generated columns still need to feel like part of your app. Infinite Table gives you a few places to customize them.

The first option is inheritance. If an aggregation reducer is bound to a field that already has a column, the generated pivot column inherits the original column configuration.

```tsx
const columns: InfiniteTablePropColumns<Developer> = {
  salary: {
    field: 'salary',
    type: 'number',
    style: { color: 'red' },
  }
}

const aggregationReducers = {
  avgSalary: {
    field: 'salary',
    reducer: 'avg',
  }
}

```

That means your formatting, sizing, and column behavior can stay close to the original field definition.

When you need more control, use <DataSourcePropLink name="pivotBy.column" />. It can be an object applied to all generated columns for that pivot level, or a function that receives the generated column metadata.

```tsx
const pivotBy: DataSourcePivotBy<Developer>[] = [
  { field: 'country' },
  {
    field: 'canDesign',
    column: ({ column }) => {
      const lastKey = column.pivotGroupKeys[column.pivotGroupKeys.length - 1];

      return {
        header: lastKey === 'yes' ? 'Designer' : 'Non-designer',
      };
    },
  },
];
```

That small callback is enough to turn raw data values into business-friendly column headers while keeping the column generation automatic.

## Totals and grand totals

Pivoted reports usually need totals. Infinite Table supports both:

- <PropLink name="pivotTotalColumnPosition" /> for totals inside pivot groups
- <PropLink name="pivotGrandTotalColumnPosition" /> for grand-total columns across the configured aggregations

```tsx
<InfiniteTable<Developer>
  columns={columns}
  pivotColumns={pivotColumns}
  pivotColumnGroups={pivotColumnGroups}
  pivotTotalColumnPosition="end"
  pivotGrandTotalColumnPosition="start"
/>
```

This gives you the spreadsheet-like summary columns people expect from a pivot view, while keeping the placement explicit.

<Sandpack title="Pivot totals and grand-total columns" size="md" viewMode="preview">

<Description>

This docs example places regular pivot totals at the end of each pivot group and grand-total columns at the start of the grid.

</Description>

```tsx live file="$DOCS/reference/pivot-grand-total-column-position-example.page.tsx"

```

</Sandpack>

## When pivoting is a good fit

Reach for pivoting when the question is not "which rows match this filter?" but "how do values compare across dimensions?"

Good use cases include:

- revenue by region and product line
- headcount by department and location
- average salary by technology stack and country
- support volume by priority and channel
- inventory by warehouse and status

In each case, the column structure depends on the data. That is where generated pivot columns help: you describe the dimensions and aggregations, and Infinite Table creates the report surface.

## Go deeper in the docs

Start with the [pivoting overview](/docs/learn/grouping-and-pivoting/pivoting/overview) for the core `pivotBy` setup.

Then read [customizing pivot columns](/docs/learn/grouping-and-pivoting/pivoting/customizing-pivot-columns) to tune generated headers, widths, inherited column behavior, and per-pivot-value column configuration.

If your data is too large to reshape in the browser, the same pivoting guide also covers server-side pivoting, where `DataSource.data` returns already-pivoted groups while Infinite Table keeps the UI model consistent.
