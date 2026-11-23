---
title: "Column sizing in React DataGrids: fixed, flexible, resizable, and auto-sized"
description: "Learn how Infinite Table combines fixed widths, flex columns, controlled resize state, column group resizing, and auto-sizing for production React DataGrids."
date: 2026-09-19
author: radu
tags: columns, sizing, react-datagrid
---

Column sizing looks like a small detail until your DataGrid becomes the main surface of an application.

Users want IDs to stay compact, names to have room, money columns to line up, and wide text columns to take the space that is left. They also expect to resize columns, come back later, and find the grid exactly as they left it.

Infinite Table's [Column Sizing docs](/docs/learn/columns/fixed-and-flexible-size) cover those cases with a single model:

- fixed columns use an explicit width
- flexible columns divide the remaining viewport space
- min and max sizes keep important columns readable
- controlled sizing lets you persist user changes
- grouped headers can be resized too
- `autoSizeColumnsKey` can measure content and update widths declaratively

This article turns that API into a practical checklist for production grids.

## Start with defaults that match the table

Every column in Infinite Table has a size, even if you do not configure one. Unconfigured columns fall back to <PropLink name="columnDefaultWidth" />, which defaults to `200px`.

For a quick first pass, configure size on the column itself:

```tsx
const columns = {
  firstName: {
    field: 'firstName',
    defaultWidth: 200,
  },
  country: {
    field: 'country',
    defaultFlex: 1,
  },
};

<InfiniteTable columns={columns} columnDefaultWidth={100} />;
```

Use <PropLink name="columns.defaultWidth" /> for columns that should start at a predictable pixel width. Use <PropLink name="columns.defaultFlex" /> for columns that should grow into the available space.

That split works well for many tables:

- identifiers, status badges, boolean values: fixed
- names, descriptions, addresses, titles: flexible
- numeric columns: fixed or narrow flex, depending on the report

<Sandpack title="Column default width and flex sizing" size="md" viewMode="preview">

<Description>

The `firstName` column starts with a fixed width, the `country` column uses flex, and the remaining columns fall back to `columnDefaultWidth`.

</Description>

```tsx live file="$DOCS/reference/column-defaultWidth-defaultFlex-example.page.tsx"

```

</Sandpack>

## Move sizing state out of the column object

Column-level defaults are intentionally uncontrolled. They describe the initial layout, not a value you keep updating after every drag.

When column size becomes user state, move it to <PropLink name="columnSizing" />:

```tsx
const [columnSizing, setColumnSizing] = React.useState({
  country: { width: 100 },
  city: { flex: 1, minWidth: 100 },
  salary: { flex: 2, maxWidth: 500 },
});

<InfiniteTable
  columns={columns}
  columnSizing={columnSizing}
  onColumnSizingChange={setColumnSizing}
/>;
```

The shape is a map of column id to sizing configuration. A sizing entry can use:

- <PropLink name="columnSizing.width" /> for fixed columns
- <PropLink name="columnSizing.flex" /> for flexible columns
- <PropLink name="columnSizing.minWidth" /> to protect a minimum readable size
- <PropLink name="columnSizing.maxWidth" /> to stop a column from growing too far

This is also the shape you can persist in local storage, a user profile, or a server-side layout preset.

<Sandpack title="Controlled column sizing" size="md" viewMode="preview">

<Description>

Resize columns in the grid. The controlled `columnSizing` object updates with the new fixed and flex values.

</Description>

```tsx live file="$DOCS/reference/columnSizing-example.page.tsx"

```

</Sandpack>

## Understand what happens when users resize flex columns

Flex columns start by dividing the space that remains after fixed columns are measured.

If a grid has `1000px` available, fixed columns take `400px`, and the remaining flex values add up to `3`, then one flex unit is `200px`. A column with `flex: 1` gets `200px`; a column with `flex: 2` gets `400px`.

After the user resizes flexible columns, Infinite Table keeps them flexible. The new flex values are based on the measured pixel widths at the time of the resize, so the proportions remain stable when the table grows or shrinks later.

That detail matters for responsive layouts: users can resize a grid on a large monitor and still get a sensible proportional layout when the panel narrows.

## Track reserved viewport width

When fixed and flexible columns are mixed, resizing may create reserved space in the viewport. Infinite Table exposes that value through <PropLink name="viewportReservedWidth" /> and <PropLink name="onViewportReservedWidthChange" />.

```tsx
const [viewportReservedWidth, setViewportReservedWidth] = React.useState(0);

<InfiniteTable
  columns={columns}
  columnSizing={columnSizing}
  onColumnSizingChange={setColumnSizing}
  viewportReservedWidth={viewportReservedWidth}
  onViewportReservedWidthChange={setViewportReservedWidth}
/>;
```

Persist it alongside `columnSizing` if you want the restored layout to match the user's resized grid exactly.

There is also a useful interaction detail in the docs: when users resize while holding **SHIFT**, adjacent columns share the available space, so the reserved viewport width is preserved.

<Sandpack title="Viewport reserved width with flexible columns" size="md" viewMode="preview">

<Description>

Resize a column and watch `viewportReservedWidth` update. Reset it to return the flex layout to the full viewport.

</Description>

```tsx live file="$DOCS/reference/viewportReservedWidth-example.page.tsx"

```

</Sandpack>

## Resize column groups without extra code

Column groups are part of the same sizing system. If a group contains at least one resizable column, users can drag the group boundary. Infinite Table distributes the change across the resizable columns in that group.

Min and max widths still apply. When a column reaches a constraint, the other resizable columns can continue changing. When the whole group has reached its constraints, the resize handle shows the constrained state.

<Sandpack title="Resizable column groups" size="md" viewMode="preview">

<Description>

Try resizing the Finance and Regional Info groups. The constraints on their child columns are still respected.

</Description>

```tsx live file="$DOCS/reference/column-groups-example.page.tsx"

```

</Sandpack>

This is especially useful for enterprise grids with grouped finance, location, inventory, or metrics columns. You can give users a high-level handle without losing the per-column rules you already configured.

## Auto-size columns when content changes

Some layouts should be measured from content instead of guessed upfront. Use <PropLink name="autoSizeColumnsKey" /> when you want Infinite Table to auto-size columns declaratively.

Pass a string or number and change it whenever columns should be measured again:

```tsx
<InfiniteTable autoSizeColumnsKey={version} />;
```

Pass an object when you need more control:

```tsx
const autoSizeColumnsKey = {
  key: version,
  includeHeader: true,
  columnsToResize: ['firstName', 'country', 'salary'],
};
```

The object form can:

- include or skip header text in the measurement
- auto-size only specific columns
- skip columns that should keep their current size

When auto-sizing runs, <PropLink name="onColumnSizingChange" /> is called with the measured sizes. If you are using controlled <PropLink name="columnSizing" />, update it from that callback so the new measured layout becomes the current layout.

<Sandpack title="Auto-sizing columns" size="md" viewMode="preview">

<Description>

Click the button to bump `autoSizeColumnsKey` and measure the columns again. Toggle whether the header text participates in the measurement.

</Description>

```tsx live file="$DOCS/reference/autoSizeColumnsKey-example.page.tsx"

```

</Sandpack>

## A production checklist

For most application grids, the sequence is:

1. Set <PropLink name="columnDefaultWidth" /> for the general fallback.
2. Use <PropLink name="columns.defaultWidth" /> for compact, predictable columns.
3. Use <PropLink name="columns.defaultFlex" /> or <PropLink name="defaultColumnSizing" /> for columns that should share remaining space.
4. Add min and max widths where readability matters.
5. Switch to controlled <PropLink name="columnSizing" /> when you need to persist user changes.
6. Persist <PropLink name="viewportReservedWidth" /> with sizing state for exact restores.
7. Use <PropLink name="autoSizeColumnsKey" /> for "fit to content" moments after data, columns, or user presets change.

Column sizing is not a separate layout system you have to build around the DataGrid. It is part of Infinite Table's column model, works with column groups, respects constraints, and gives you a serializable state object when layout becomes user preference.

## Go deeper in the docs

- [Column Sizing](/docs/learn/columns/fixed-and-flexible-size) - fixed width, flex sizing, resizing, group resizing, and auto-sizing
- <PropLink name="columnSizing" /> - controlled sizing state
- <PropLink name="defaultColumnSizing" /> - uncontrolled initial sizing state
- <PropLink name="autoSizeColumnsKey" /> - declarative content-based measuring
- <PropLink name="viewportReservedWidth" /> and <PropLink name="onViewportReservedWidthChange" /> - tracking reserved viewport space
