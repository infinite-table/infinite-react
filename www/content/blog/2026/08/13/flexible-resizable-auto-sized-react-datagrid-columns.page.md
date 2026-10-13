---
title: "Making React DataGrid columns fit: fixed, flex, resize, and auto-size"
description: Use Infinite Table column sizing to combine fixed widths, flexible columns, user resizing, resizable column groups, and declarative auto-sizing.
date: 2026-08-13
author: radu
tags: columns, column-sizing, react-datagrid
---

Column sizing looks simple until a real product screen has to support all the
states your users care about.

Some columns should always stay compact: IDs, status pills, action buttons.
Some columns should take the remaining room: names, descriptions, comments,
addresses. Users expect to drag resize handles, come back tomorrow, and see the
same layout. Dense finance or analytics screens often need grouped headers that
resize together. And sometimes the right width is not a design token at all - it
is the width of the current cell values.

Infinite Table's [column sizing docs](/docs/learn/columns/fixed-and-flexible-size)
cover that whole workflow. This article walks through the practical decisions:
when to use fixed widths, when to use flex sizing, when to move to controlled
state, and when to trigger auto-sizing.

## Start with default widths

Every column needs a starting size. You can set it column by column with
<PropLink name="columns.defaultWidth" /> or use
<PropLink name="columnDefaultWidth" /> as the fallback for every column that
does not define its own size.

```tsx
const columns = {
  id: {
    field: 'id',
    defaultWidth: 80,
  },
  status: {
    field: 'status',
    defaultWidth: 120,
  },
  customerName: {
    field: 'customerName',
  },
};

<InfiniteTable columns={columns} columnDefaultWidth={200} />;
```

That is enough for stable, predictable layouts: the `id` and `status` columns
stay compact, and `customerName` falls back to `200px`.

The important word is `default`. The `defaultWidth`, `defaultFlex`, and
`defaultColumnSizing` props describe the initial uncontrolled size. They are a
good fit when your app does not need to save user-resized widths or update them
from outside the grid.

## Mix fixed and flexible columns

Fixed widths are best for columns whose content has a known shape. Flexible
columns are best for fields that should absorb the available viewport: names,
titles, descriptions, locations, or any content that benefits from more room.

Use <PropLink name="columns.defaultFlex" /> for flexible columns, together with
minimum and maximum limits when the design needs guardrails.

```tsx
const columns = {
  id: {
    field: 'id',
    defaultWidth: 80,
  },
  city: {
    field: 'city',
    defaultFlex: 1,
    minWidth: 120,
  },
  notes: {
    field: 'notes',
    defaultFlex: 2,
    minWidth: 240,
  },
};
```

In this layout, `notes` receives twice as much remaining space as `city`, while
`id` keeps its fixed width. When the viewport grows or shrinks, Infinite Table
recomputes the flexible widths in the same spirit as CSS flexbox.

For product screens, that gives you a useful rule of thumb:

- fixed width for identifiers, icons, numeric summaries, and action columns
- flex width for human-readable content that should breathe
- `minWidth` / `maxWidth` for columns that should not collapse or dominate the
  screen

## Control sizing when you need to persist it

Once users can personalize column widths, the sizing state usually belongs in
your app. Use <PropLink name="columnSizing" /> together with
<PropLink name="onColumnSizingChange" /> when you want controlled behavior.

```tsx
const [columnSizing, setColumnSizing] = React.useState({
  country: { width: 120 },
  city: { flex: 1, minWidth: 160 },
  salary: { flex: 2, maxWidth: 500 },
});

<InfiniteTable
  columns={columns}
  columnSizing={columnSizing}
  onColumnSizingChange={setColumnSizing}
/>;
```

The state shape is keyed by column id. Each entry can describe a fixed `width` or
a flexible `flex` value, plus optional min/max limits. This keeps the persistent
layout separate from the column definitions, which is useful when your `columns`
object already contains rendering, formatting, sorting, and editing rules.

<Sandpack title="Controlled column sizing" size="md" viewMode="preview">

<Description>

Resize columns and inspect the controlled `columnSizing` state emitted by
<PropLink name="onColumnSizingChange" />.

</Description>

```tsx live file="$DOCS/reference/columnSizing-example.page.tsx"

```

</Sandpack>

Controlled sizing is the pattern to reach for when you want to:

- store widths in local storage
- persist a user's grid layout to the backend
- restore a saved workspace
- ship role-based default layouts that users can still customize
- keep a separate "reset layout" action in your product UI

## Understand what happens when users resize

Columns are resizable by default. If a specific column should not be resizable,
set `column.resizable = false`; if the whole grid should opt out, configure
<PropLink name="resizableColumns" />.

There are two resizing behaviors worth designing for:

1. **Normal resize** - dragging a column wider pushes the following columns and
   increases the reserved horizontal space.
2. **Shared-space resize** - holding `Shift` while resizing shares space between
   adjacent columns, preserving the reserved viewport width.

The `viewportReservedWidth` value is useful when flexible columns and manual
resizing meet. Infinite Table uses it to know how much horizontal space is
reserved outside the flex calculation, so a resized layout can keep behaving
predictably as the viewport changes.

If your screen has grouped headers, users can resize column groups as well. That
matters for report-style grids where a "Finance" group or "Regional Info" group
needs to grow and shrink as a unit.

<Sandpack title="Resizing column groups" size="md" viewMode="preview">

<Description>

Try resizing the `Finance` and `Regional Info` column groups. The columns inside
each group share the resize while respecting their width limits.

</Description>

```tsx live file="$DOCS/reference/column-groups-example.page.tsx"

```

</Sandpack>

## Trigger auto-sizing when content changes

Sometimes the right width depends on the current data. A customer name column
might be short in one account and long in another. A status column might switch
from compact codes to translated labels. An import preview might need to size
columns after the first batch loads.

Use <PropLink name="autoSizeColumnsKey" /> to declaratively trigger
auto-sizing. Change the key when Infinite Table should measure content and
resize columns.

```tsx
const autoSizeColumnsKey = {
  key: autosizeVersion,
  includeHeader: true,
  columnsToResize: ['customerName', 'city', 'status'],
};

<InfiniteTable
  columns={columns}
  autoSizeColumnsKey={autoSizeColumnsKey}
/>;
```

When `autoSizeColumnsKey` is an object, you can decide whether header content is
included and whether all columns, only a chosen list, or every column except a
skip list should be measured.

<Sandpack title="Auto-sizing columns from content" size="md" viewMode="preview">

<Description>

Toggle whether headers are included, then click the button to trigger
<PropLink name="autoSizeColumnsKey" /> with a new key.

</Description>

```tsx live file="$DOCS/reference/autoSizeColumnsKey-example.page.tsx"

```

</Sandpack>

Auto-sizing is especially useful after:

- changing datasets
- changing locale or formatting
- revealing optional columns
- loading a saved report definition
- switching between compact and comfortable density

## A practical sizing recipe

For a production grid, start with a small set of sizing decisions and grow from
there:

1. Give compact utility columns fixed widths.
2. Give readable text columns `defaultFlex` and sensible `minWidth` values.
3. Add `maxWidth` to columns that should not take over wide screens.
4. Move to controlled `columnSizing` once the user can resize and save layouts.
5. Use `autoSizeColumnsKey` for explicit "fit to content" moments instead of
   trying to calculate widths by hand.
6. For grouped headers, test group resizing so report sections behave as users
   expect.

That keeps the initial implementation simple, but leaves room for advanced
workflows such as saved workspaces, per-role layouts, and responsive reporting
surfaces.

## Go deeper in the docs

- [Column sizing](/docs/learn/columns/fixed-and-flexible-size) - fixed widths,
  flex widths, controlled sizing, resizing, group resizing, and auto-sizing
- [Column order](/docs/learn/columns/column-order) - pair saved sizing with saved
  column order
- [Column grouping](/docs/learn/columns/column-grouping) - build grouped headers
  that can be resized together
