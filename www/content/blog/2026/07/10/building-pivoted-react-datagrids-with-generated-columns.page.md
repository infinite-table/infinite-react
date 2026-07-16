---
title: Building pivoted React DataGrids with generated columns
description: Turn grouped data into cross-tab reports with Infinite Table pivoting, generated columns, custom pivot headers, totals, and server-side pivot loading.
date: 2026-07-10
author: radu
tags: pivoting, grouping, analytics
---

Pivot tables start as a reporting request and quickly become a UI architecture problem.

You need to group rows, aggregate values, create columns from data values, keep those columns typed, and still leave room to customize headers, widths, formatting, totals, and server-side loading. Infinite Table's pivoting feature keeps that work inside the `DataSource` pipeline so your React grid can render a report-style layout without hardcoding every possible result column.

The docs cover this in the [pivoting guide](/docs/learn/grouping-and-pivoting/pivoting/overview). This article walks through the key idea — define pivoting at the data level, then render the generated columns in `<InfiniteTable />` — and maps it to real product scenarios.

## Pivoting belongs in the DataSource

In Infinite Table, the `DataSource` owns grouping, pivoting, and aggregation because those features reshape the data before the grid renders it.

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

The `children` render prop of the `DataSource` is the handoff for a pivot DataGrid. The `DataSource` looks at <DataSourcePropLink name="pivotBy" /> and <DataSourcePropLink name="aggregationReducers" />, groups and aggregates the data, then gives the table the generated `pivotColumns` and `pivotColumnGroups`.

Without that split, you would scan the dataset yourself, discover every pivot value, construct matching columns, wire column groups, and keep the result in sync as grouping or pivoting changes.

## Map a business question to pivot config

A useful way to design a pivot view is to write the question first, then fill in three lists:

- **Rows** (`groupBy`) — what you compare down the page: region, department, product line
- **Columns** (`pivotBy`) — what becomes generated headers: month, channel, plan tier
- **Values** (`aggregationReducers`) — what you measure: sum of revenue, avg salary, ticket count

If the column headers depend on values in the data — countries that appear this quarter, warehouses that currently hold stock, channels that received tickets — you want generated pivot columns, not a static column list.

## Scenario 1: People analytics — language × stack, pivoted by country

Imagine a developers analytics grid. Rows are grouped by `preferredLanguage` and `stack`, then pivoted by `country` and whether a developer can design. Instead of one salary column, the grid shows aggregated salary for each country/design combination.

That is the classic “compare compensation across geography while keeping role structure on the rows” report — the same shape as headcount or average salary by department and location.

The demo below groups developers, pivots the salary aggregation into generated columns, and starts with groups collapsed so the cross-tab is easy to scan.

<Sandpack title="Pivoting with generated columns" size="md" viewMode="preview">

<Description>

Expand a group to see aggregated salary values distributed across generated pivot columns. Full walkthrough: [pivoting overview](/docs/learn/grouping-and-pivoting/pivoting/overview).

</Description>

```tsx live file="$DOCS/learn/grouping-and-pivoting/pivoting/pivoting-example.page.tsx"

```

</Sandpack>

In product terms, the same shape answers questions like:

- Average salary by technology stack, broken out by country
- Headcount by department, broken out by office
- Utilization by team, broken out by project phase

## Scenario 2: Support ops — volume by priority × channel

Support and customer-success teams often need a matrix, not a flat ticket list:

- **Rows:** priority (`critical`, `high`, `normal`) or product area
- **Columns:** channel (`email`, `chat`, `phone`, `portal`)
- **Values:** ticket count, average time-to-first-response, reopen rate

```tsx
const groupBy = [{ field: 'priority' }, { field: 'productArea' }];
const pivotBy = [{ field: 'channel' }];

const aggregationReducers = {
  ticketCount: {
    name: 'Tickets',
    initialValue: 0,
    reducer: (acc) => acc + 1,
  },
  avgFirstResponseMins: {
    name: 'Avg first response (min)',
    field: 'firstResponseMins',
    initialValue: 0,
    reducer: (acc, value) => acc + value,
    done: (sum, arr) => (arr.length ? sum / arr.length : 0),
  },
};
```

As new channels appear in the feed, Infinite Table generates matching pivot columns. You do not ship a release every time marketing adds “WhatsApp” as a support channel.

The same pattern works for sales pipeline stages by region, or incidents by severity and service.

## Scenario 3: Commerce — revenue by product line × region (with totals)

Finance and merchandising reports usually need both the matrix and the summary columns:

- **Rows:** product category → SKU family
- **Columns:** region → sales channel
- **Values:** sum of revenue, sum of units

That is where <PropLink name="pivotTotalColumnPosition" /> and <PropLink name="pivotGrandTotalColumnPosition" /> matter:

- Pivot totals summarize inside a pivot group (for example, all channels under EMEA)
- Grand totals summarize across the whole pivot surface for each aggregation

Pivot total columns only appear when you pivot by two or more fields (`pivotBy.length > 1`). With a single pivot field, enabling <PropLink name="pivotTotalColumnPosition" /> has no effect — those totals would duplicate the values already shown. The example below uses two pivot levels (`stack` and `canDesign`) so both kinds of totals are visible.

```tsx
const pivotBy = [{ field: 'stack' }, { field: 'canDesign' }];

<InfiniteTable<Developer>
  columns={columns}
  pivotColumns={pivotColumns}
  pivotColumnGroups={pivotColumnGroups}
  pivotTotalColumnPosition="end"
  pivotGrandTotalColumnPosition="start"
/>
```

<Sandpack title="Pivot totals and grand-total columns" size="md" viewMode="preview">

<Description>

Pivot total columns sit at the end of each stack group. Grand-total columns are placed at the start of the grid.

</Description>

```tsx live file="$DOCS/reference/pivot-grand-total-column-position-example.page.tsx"

```

</Sandpack>

For a commerce grid, that reads as: revenue for each region/channel cell, a subtotal per region, and a grand total for the selected filters — spreadsheet expectations, without building spreadsheet UI yourself.

## Scenario 4: Inventory — warehouse × status, readable headers

Generated columns still need to feel like part of your app. Infinite Table gives you a few customization layers.

### Inherit formatting from source columns

If an aggregation reducer is bound to a field that already has a column, the generated pivot column inherits that column configuration — number formatting, styles, default width, and related behavior.

```tsx
const columns: InfiniteTablePropColumns<Developer> = {
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

<Sandpack title="Generated pivot columns inherit column config" size="md" viewMode="preview">

<Description>

Aggregations bound to `salary` / `age` pick up the original column styling. See also [customizing pivot columns](/docs/learn/grouping-and-pivoting/pivoting/customizing-pivot-columns).

</Description>

```tsx live file="$DOCS/learn/grouping-and-pivoting/pivoting/pivot-column-inherit-example.page.tsx"

```

</Sandpack>

### Rename raw values into business labels

Inventory status codes (`in_stock`, `reserved`, `quarantine`) or boolean flags rarely belong in a header as-is. Use <DataSourcePropLink name="pivotBy.column" /> as an object for every generated column at that pivot level, or as a function that receives the generated column metadata.

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

That callback turns raw pivot keys into labels operators recognize, while column generation stays automatic.

<Sandpack title="Custom headers on generated pivot columns" size="md" viewMode="preview">

<Description>

The `canDesign` pivot values are rewritten to Designer / Non-designer headers. Try collapsing and expanding groups to see the column groups stay aligned.

</Description>

```tsx live file="$DOCS/learn/grouping-and-pivoting/pivoting/pivoting-customize-column-example.page.tsx"

```

</Sandpack>

A warehouse dashboard might look like:

```tsx
const groupBy = [{ field: 'skuFamily' }, { field: 'sku' }];
const pivotBy = [
  { field: 'warehouse' },
  {
    field: 'status',
    column: ({ column }) => {
      const status =
        column.pivotGroupKeys[column.pivotGroupKeys.length - 1];
      const labels: Record<string, string> = {
        in_stock: 'Available',
        reserved: 'Reserved',
        quarantine: 'Quarantine',
      };

      return {
        header: labels[status] ?? String(status),
        defaultWidth: 120,
      };
    },
  },
];

const aggregationReducers = {
  units: {
    name: 'Units',
    field: 'quantity',
    initialValue: 0,
    reducer: (acc, value) => acc + value,
  },
};
```

New warehouses in the dataset become new column groups without a frontend schema change.

## Scenario 5: SaaS metrics — plans and regions at scale

Product analytics often outgrows client-side reshaping: millions of subscription events, weekly cohorts, plan × region matrices. For that case, keep the same Infinite Table UI model and move the pivot computation to the server.

Enable <DataSourcePropLink name="lazyLoad" /> and provide a function for <DataSourcePropLink name="data" /> that returns already-pivoted groups. The grid still generates `pivotColumns` / `pivotColumnGroups` from <DataSourcePropLink name="pivotBy" /> and <DataSourcePropLink name="aggregationReducers" />, but leaf rows are not loaded — pivoting works on aggregated group payloads.

```tsx
const groupBy = [{ field: 'country' }, { field: 'stack' }];
const pivotBy = [
  { field: 'preferredLanguage' },
  { field: 'canDesign' },
];

const aggregationReducers = {
  salary: { name: 'Salary (avg)', field: 'salary', reducer: 'avg' },
  age: { name: 'Age (avg)', field: 'age', reducer: 'avg' },
};

const dataSource = ({ groupBy, pivotBy, groupKeys, aggregationReducers }) => {
  // Fetch a Promise that resolves to { data, totalCount, pivot, ... }
  // See the pivoting docs for the full response shape.
};

<DataSource lazyLoad data={dataSource} groupBy={groupBy} pivotBy={pivotBy} />;
```

Typical SaaS mappings:

- **MRR by segment and plan** — `groupBy`: `segment` → `accountTier`; `pivotBy`: `plan` → `billingInterval`; aggregations: `sum(mrr)`, `count(accounts)`
- **Activation by acquisition channel** — `groupBy`: `week` → `cohort`; `pivotBy`: `channel`; aggregation: `avg(activationRate)`
- **Churn by region and product** — `groupBy`: `region`; `pivotBy`: `product` → `plan`; aggregation: `sum(churnedMrr)`

<Sandpack title="Server-side pivoting" size="md" viewMode="preview">

<Description>

Grouping and pivot aggregations are loaded remotely. Expand countries to fetch nested groups with pivot values already computed on the server.

</Description>

```tsx live file="$DOCS/learn/grouping-and-pivoting/pivoting/remote-pivoting-example.page.tsx"

```

</Sandpack>

For very large trees, the same guide covers [lazy-load batching](/docs/learn/grouping-and-pivoting/pivoting/overview#another-pivoting-example-with-batching) so groups stream in pages while the pivot column model stays consistent.

## Scenario 6: Let users change the report at runtime

Many analytics products need more than one fixed pivot. Users want to switch “group by department, pivot by month” to “group by region, pivot by product line” without a new screen.

Because `groupBy`, `pivotBy`, and `aggregationReducers` are ordinary React props, you can drive them from UI state. The [dynamic pivoting example](/docs/learn/examples/dynamic-pivoting-example) shows client-side and server-side variants where those dimensions change at runtime, including custom number/currency formatting on the generated columns.

That is the difference between a static export and an interactive report builder: the DataSource recomputes (or re-fetches) the pivot surface; `<InfiniteTable />` keeps rendering whatever `pivotColumns` it receives.

## When pivoting is a good fit

Reach for pivoting when the question is not “which rows match this filter?” but “how do values compare across dimensions?”

Good use cases:

- Revenue by region and product line (with region/channel totals)
- Headcount or average salary by department and location
- Support volume by priority and channel
- Inventory units by warehouse and stock status
- SaaS MRR / churn by plan and billing interval
- Incident count by severity and owning service

In each case the column structure depends on the data. Generated pivot columns are the point: you describe dimensions and aggregations, and Infinite Table creates the report surface.

## Go deeper in the docs

- [Pivoting overview](/docs/learn/grouping-and-pivoting/pivoting/overview) — core `pivotBy` setup, totals, and server-side pivoting
- [Customizing pivot columns](/docs/learn/grouping-and-pivoting/pivoting/customizing-pivot-columns) — inheritance, headers, widths, per-value column config
- [Dynamic pivoting example](/docs/learn/examples/dynamic-pivoting-example) — change group/pivot/aggregations from the UI
- [Grouping and aggregations](/docs/learn/grouping-and-pivoting/group-aggregations) — reducer shapes that power pivot values
