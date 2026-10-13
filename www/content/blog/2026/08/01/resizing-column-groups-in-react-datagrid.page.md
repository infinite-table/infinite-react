---
title: Resize column groups in your React DataGrid
description: Give users a faster way to tune dense grouped-column layouts by resizing whole column groups in Infinite Table.
date: 2026-08-01
author: radu
tags: columns, column groups, ux
---

Grouped columns make a DataGrid easier to scan, but they also introduce a layout question: what should happen when a user needs more room for an entire section?

Resizing one column at a time works for small tables. In a wide operational grid, though, users often think in sections: Finance needs more space, Regional Info can shrink, Contact Details should stay readable. Infinite Table supports that workflow directly: [column groups can be resized](/docs/learn/columns/fixed-and-flexible-size#resizing-column-groups), not just individual columns.

## Why group-level resizing matters

Column groups are useful when a table mixes different kinds of data:

- Finance columns such as currency, salary, margin, or invoice totals
- Regional columns such as country, city, territory, or warehouse
- Status columns such as lifecycle stage, priority, and owner
- Audit columns such as created date, updated date, and changed by

Once users see those sections in the header, they naturally expect layout controls to work at the same level. If a grouped header says `Finance`, dragging its right edge should adjust the finance section as a unit.

That is the feature highlighted in the docs: when a column group contains at least one resizable column, the group header gets a resize affordance. Dragging it distributes the width change across the resizable columns inside that group.

## The same column model powers the layout

You define column groups separately from columns, then attach columns to groups with <PropLink name="columns.columnGroup" />.

```tsx
const columns = {
  currency: {
    field: 'currency',
    columnGroup: 'finance',
    maxWidth: 130,
  },
  salary: {
    field: 'salary',
    columnGroup: 'finance',
    maxWidth: 130,
  },
  country: {
    field: 'country',
    columnGroup: 'regionalInfo',
  },
};

const columnGroups = {
  regionalInfo: {
    header: 'Regional Info',
  },
  finance: {
    header: 'Finance',
    columnGroup: 'regionalInfo',
  },
};
```

This keeps the structure declarative:

- `currency` and `salary` belong to the `Finance` group
- `Finance` itself belongs to `Regional Info`
- `Regional Info` is the top-level group

Because the group tree is part of the table configuration, Infinite Table can render the nested headers and expose resize handles at the appropriate group levels.

For the full setup, start with the [column groups guide](/docs/learn/columns/column-grouping), then open the sizing docs section on [resizing column groups](/docs/learn/columns/fixed-and-flexible-size#resizing-column-groups).

## Try resizing nested groups

The demo below uses the same example from the docs. Try dragging the right edge of `Finance` first, then the right edge of `Regional Info`.

<Sandpack title="Resizing column groups" size="md" viewMode="preview">

<Description>

Resize the `Finance` and `Regional Info` column groups. The resize interaction shares space across the resizable columns in the group and respects each column's min/max constraints.

</Description>

```tsx live file="$DOCS/reference/column-groups-example.page.tsx"

```

</Sandpack>

Two details are worth noticing:

1. Nested groups can be resized at different levels. The handle height shows which group level you are resizing.
2. Column constraints still apply. If the columns in a group hit their min or max width, the resize handle indicates the constraint instead of silently breaking the layout.

That second behavior is important for production grids. Users get flexibility, but the table still honors the guardrails you set in column definitions.

## Persisting user-sized group layouts

If your app lets users customize their grid layout, listen to <PropLink name="onColumnSizingChange" />.

```tsx
<InfiniteTable
  columns={columns}
  columnGroups={columnGroups}
  onColumnSizingChange={(columnSizing) => {
    saveGridLayout({ columnSizing });
  }}
/>
```

The callback fires when resizing is confirmed, including column-group resizing. That gives you one place to persist user preferences, whether the user resized a single column or a whole grouped section.

You can then pass those saved values back through your column configuration on the next visit, so the user's dense finance view or expanded regional view comes back exactly as they left it.

## When to use column-group resizing

Reach for group-level resizing when your DataGrid has clear visual sections and users need to rebalance space between them:

- Finance dashboards where users compare compact IDs with wide numeric columns
- Inventory screens where warehouse and stock-status groups compete for horizontal space
- CRM tables where contact details, account health, and sales activity sit together
- Admin tools where audit metadata is useful but should not dominate the layout

Individual column resizing is still available. Group resizing simply gives users a bigger handle for bigger layout decisions.

## Go deeper in the docs

- [Column groups](/docs/learn/columns/column-grouping) - define grouped and nested headers
- [Fixed and flexible column size](/docs/learn/columns/fixed-and-flexible-size) - configure widths, flex columns, resize behavior, and constraints
- [Resizing column groups](/docs/learn/columns/fixed-and-flexible-size#resizing-column-groups) - inspect the live demo configuration
