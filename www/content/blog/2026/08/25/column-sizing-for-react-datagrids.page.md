---
title: A practical guide to column sizing in React DataGrids
description: Learn how to combine fixed widths, flex sizing, controlled column sizing, user resizing, column groups, and auto-sizing in Infinite Table.
date: 2026-08-25
author: radu
tags: columns, sizing, react-datagrid
---

Column sizing is one of those DataGrid features that looks simple until the UI has to work for real users.

A sales table might need fixed widths for IDs and currency values, flexible columns for customer names, persisted user resizing for power users, and an auto-size action after data changes. Add column groups and responsive layouts, and "just set a width" is no longer enough.

Infinite Table's [Column Sizing docs](/docs/learn/columns/fixed-and-flexible-size) cover the full model. This article turns that model into a practical decision guide: when to use default widths, when to use flex, when to control sizing state, and when to let the grid measure content for you.

## Start with the sizing contract

Every column eventually resolves to either a fixed width or a flexible width.

For a simple grid, set the defaults directly on the column:

```tsx
const columns = {
  id: {
    field: 'id',
    defaultWidth: 80,
  },
  firstName: {
    field: 'firstName',
    defaultFlex: 1,
    minWidth: 160,
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultWidth: 140,
  },
};
```

Those `default*` properties are intentionally uncontrolled. They describe how the column should be sized when it first renders. After that, Infinite Table can update the size internally as users resize columns.

That makes them a good fit when:

- the initial layout is all you need to configure
- user resizing does not need to be saved
- the column model can stay focused on rendering, formatting, and behavior

You can also configure global defaults with <PropLink name="columnDefaultWidth" />, <PropLink name="columnMinWidth" />, and <PropLink name="columnMaxWidth" />. Any column that does not specify its own width or flex will fall back to those values.

## Use flex when the viewport should decide

Fixed widths are predictable, but they do not react to available space. Flexible columns use the remaining viewport width after fixed columns are accounted for.

Imagine a grid with 1000px of available width:

- `id` is fixed at `100px`
- `country` is fixed at `300px`
- `city` has `flex: 1`
- `salary` has `flex: 2`

The fixed columns take `400px`, leaving `600px` for flex columns. The total flex value is `3`, so one flex unit is `200px`: `city` receives `200px`, and `salary` receives `400px`.

If the same grid later has only `700px`, the fixed columns still take `400px`, leaving `300px` for flex columns. One flex unit becomes `100px`.

That is the key benefit: flex columns preserve the proportions you care about while adapting to the container.

```tsx
const defaultColumnSizing = {
  country: { flex: 1, minWidth: 160 },
  city: { flex: 1, minWidth: 140 },
  salary: { flex: 2, maxWidth: 500 },
};

<InfiniteTable
  columns={columns}
  columnDefaultWidth={80}
  defaultColumnSizing={defaultColumnSizing}
/>;
```

Use flex columns for content that should stretch and shrink with the application shell: names, descriptions, addresses, comments, or any field where a little extra room improves scanning.

## Move sizing state out when you need persistence

Once a user customizes column widths, the next product question is usually: "Can we remember that?"

That is where controlled <PropLink name="columnSizing" /> becomes useful. Instead of treating widths as part of the column definition, keep sizing as its own state object keyed by column id.

```tsx
const [columnSizing, setColumnSizing] = React.useState({
  country: { width: 100 },
  city: { flex: 1, minWidth: 100 },
  salary: { flex: 2, maxWidth: 500 },
});

<InfiniteTable
  columns={columns}
  columnDefaultWidth={50}
  columnSizing={columnSizing}
  onColumnSizingChange={setColumnSizing}
/>;
```

This mirrors other grid-level state such as column pinning: the columns stay stable, while user-customizable layout data can be stored, restored, synced, or reset independently.

<Sandpack title="Controlled column sizing" size="md" viewMode="preview">

<Description>

Resize columns in the demo and inspect the controlled `columnSizing` object. This example is reused from the Column Sizing docs.

</Description>

```tsx live file="$DOCS/reference/columnSizing-example.page.tsx"

```

</Sandpack>

Controlled sizing is the best fit when:

- widths should be persisted per user or per saved view
- the application offers a "reset layout" action
- column visibility, pinning, or presets can change the available space
- you need to audit or synchronize layout changes

## Let users resize without losing the model

Infinite Table columns are resizable by default. If you need to opt out globally, use <PropLink name="resizableColumns" />. If only one column should opt out, set `resizable: false` in that column definition.

```tsx
const columns = {
  id: {
    field: 'id',
    defaultWidth: 80,
    resizable: false,
  },
  customerName: {
    field: 'customerName',
    defaultFlex: 1,
    minWidth: 200,
  },
};
```

Two details from the docs are especially useful when building a polished product UI:

- **min and max widths stay active while resizing** - the resize handle shows when a limit is reached, and the column respects the configured boundary.
- **flex columns remain flexible after resizing** - Infinite Table converts the resized flex proportions into new flex values, so a customized responsive layout keeps behaving responsively.

Users can also hold **SHIFT** while resizing to share space between adjacent columns. That keeps the total occupied width stable, which is useful in dense financial or operations screens where horizontal scroll should not jump unexpectedly.

## Resize column groups as a layout unit

Column groups often represent a meaningful section of a report: finance, regional info, inventory, usage, or pipeline status. When a group is too narrow, users usually think in terms of the section, not the individual fields.

Infinite Table supports resizing column groups directly. If a column group has at least one resizable column, the group can be resized, and the available space is shared proportionally across the resizable columns inside it.

<Sandpack title="Resizing column groups" size="md" viewMode="preview">

<Description>

Try resizing the `Finance` and `Regional Info` column groups. The demo uses the same column group example from the docs.

</Description>

```tsx live file="$DOCS/reference/column-groups-example.page.tsx"

```

</Sandpack>

This is a small interaction detail that makes grouped reports feel natural. A user can make the "Finance" group wider without having to resize salary and currency columns one by one.

## Reserve viewport space for flex layouts

Sometimes the grid should leave intentional blank space in the viewport. For example, your design might reserve room for an overlay, an inline action strip, or a drop target.

Use <PropLink name="viewportReservedWidth" /> to tell Infinite Table that part of the viewport should not be used by flexible columns.

```tsx
<InfiniteTable
  columns={columns}
  defaultColumnSizing={{
    country: { flex: 1 },
    city: { flex: 1 },
    salary: { flex: 2 },
  }}
  viewportReservedWidth={50}
/>;
```

That reserved width is part of the flex sizing calculation. Fixed columns keep their widths, and flexible columns divide the remaining non-reserved space.

<Sandpack title="Reserved viewport width with flexible columns" size="md" viewMode="preview">

<Description>

This docs example reserves viewport space while keeping several columns flexible.

</Description>

```tsx live file="$DOCS/reference/viewportReservedWidth-example.page.tsx"

```

</Sandpack>

## Auto-size when content should lead

Some grids should size columns based on their content instead of a product-design guess. That is what <PropLink name="autoSizeColumnsKey" /> is for.

The prop is declarative: change the key, and Infinite Table measures and resizes columns.

```tsx
const [autoSizeKey, setAutoSizeKey] = React.useState(0);

<button onClick={() => setAutoSizeKey((key) => key + 1)}>
  Auto-size columns
</button>

<InfiniteTable columns={columns} autoSizeColumnsKey={autoSizeKey} />;
```

For more control, pass an object:

```tsx
const autoSizeColumnsKey = {
  key: autoSizeKey,
  includeHeader: true,
  columnsToResize: ['firstName', 'country', 'city'],
};
```

That lets you decide whether headers participate in measurement and whether all columns or only selected columns should be resized.

<Sandpack title="Auto-sizing columns" size="md" viewMode="preview">

<Description>

Toggle whether headers are included, then trigger auto-sizing. The example comes from the Column Sizing docs.

</Description>

```tsx live file="$DOCS/reference/autoSizeColumnsKey-example.page.tsx"

```

</Sandpack>

Auto-sizing is especially useful after:

- loading a dataset with unknown text lengths
- switching between saved views
- showing generated columns
- revealing optional columns
- applying a localization where labels and values change length

## A practical recipe

For most product tables, start with this order:

1. Give narrow structural columns fixed widths: IDs, status icons, actions, compact numbers.
2. Give content-heavy columns flex sizing with sensible min widths.
3. Keep `columnSizing` controlled when user preferences should survive navigation or reloads.
4. Use min and max widths to keep resizing useful instead of fragile.
5. Add auto-size actions for data-dependent layouts.

The important part is that these techniques compose. You do not have to choose between a responsive grid, a user-customizable grid, and a content-aware grid. Infinite Table gives you fixed widths, flex sizing, controlled state, user resizing, group resizing, and auto-sizing as parts of the same column sizing model.

If your grid currently feels "almost right" but still requires too much horizontal scrolling or manual adjustment, the [Column Sizing docs](/docs/learn/columns/fixed-and-flexible-size) are a good next stop.
