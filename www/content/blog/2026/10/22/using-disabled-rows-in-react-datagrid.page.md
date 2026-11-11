---
title: Keep React DataGrid rows visible but disabled
description: Use Infinite Table disabled rows to keep non-actionable records visible while excluding them from selection, clicks, and keyboard navigation.
date: 2026-10-22
author: radu
tags: rows, selection, keyboard-navigation
---

Some rows belong in the DataGrid even when users should not act on them.
Think of archived invoices, locked approval requests, reserved inventory,
inactive users, or records that are visible only for comparison.

Hiding those rows removes context. Leaving them fully interactive invites
mistakes. Infinite Table's [disabled rows](/docs/learn/rows/disabled-rows)
feature gives you the middle ground: the row stays visible, but it is not
selectable, clickable, or reachable through keyboard navigation.

Disabled state is owned by `<DataSource />`, so selection, context menus,
keyboard navigation, and rendering can all agree on the same row-level state.

## Start with an initial disabled state

Use <DPropLink name="defaultRowDisabledState" /> when the grid can manage the
state internally. The value uses the same include/exclude pattern used by other
Infinite Table state objects:

```tsx
<DataSource<Developer>
  primaryKey="id"
  data={data}
  defaultRowDisabledState={{
    enabledRows: true,
    disabledRows: [1, 3, 4, 5],
  }}
>
  <InfiniteTable<Developer> columns={columns} keyboardNavigation="row" />
</DataSource>
```

`enabledRows: true` means every row is enabled by default, except the ids listed
in `disabledRows`. Those values are row ids, not row indexes, so make sure
<DPropLink name="primaryKey" /> points to the stable identifier in your data.

<Sandpack title="Rows disabled from initial DataSource state" size="md" viewMode="preview">

<Description>

Rows with ids `1`, `3`, `4`, and `5` start disabled. With row keyboard
navigation enabled, focus skips over them.

</Description>

```tsx live file="$DOCS/learn/rows/initialRowDisabledState-example.page.tsx"

```

</Sandpack>

## Pick the shape that matches your data

The row disabled state is intentionally symmetric:

```ts
type RowDisabledState = {
  enabledRows: true | Array<RowId>;
  disabledRows: true | Array<RowId>;
};
```

Use a deny-list when most rows are actionable:

```ts
const defaultRowDisabledState = {
  enabledRows: true,
  disabledRows: ['archived-1', 'archived-2'],
};
```

Use an allow-list when most rows should be read-only:

```ts
const defaultRowDisabledState = {
  enabledRows: ['draft-1', 'draft-2'],
  disabledRows: true,
};
```

That second shape is useful for review queues, permissions screens, or large
server-backed datasets where "everything is disabled except these rows" is
smaller and clearer than listing every disabled row.

If the disabled state belongs in your application state, use the controlled
<DPropLink name="rowDisabledState" /> prop and keep it in sync with
<DPropLink name="onRowDisabledStateChange" />.

## Use a rule when disabled rows follow business logic

Some disabled rows should not be stored as a list at all. If the rule is derived
from each record, pass <DPropLink name="isRowDisabled" /> instead.

```tsx
type Invoice = {
  id: string;
  status: 'draft' | 'sent' | 'paid' | 'void';
};

<DataSource<Invoice>
  primaryKey="id"
  data={invoices}
  isRowDisabled={(rowInfo) => rowInfo.data.status === 'void'}
>
  <InfiniteTable<Invoice> columns={columns} />
</DataSource>;
```

<DPropLink name="isRowDisabled" /> is the final decision point for a row. When
you use it, it overrides <DPropLink name="defaultRowDisabledState" /> and
<DPropLink name="rowDisabledState" />. That makes it a good fit for invariant
rules such as "void invoices cannot be edited" or "users without a license are
not selectable."

## Render disabled rows differently

Disabled rows should still communicate why they are disabled. Every cell render
receives row information, and the row info object exposes `rowDisabled`.

```tsx
const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    renderValue: ({ rowInfo, value }) => {
      return rowInfo.rowDisabled ? `${value} [disabled]` : value;
    },
  },
};
```

You can use the same flag to render a lock badge, reduce opacity, add a tooltip,
or show a reason next to the value.

<Sandpack title="Render against rowInfo.rowDisabled" size="md" viewMode="preview">

<Description>

The `firstName` column reads `rowInfo.rowDisabled` and marks disabled rows in
the cell content. The buttons above the grid enable or disable all rows through
the DataSource API.

</Description>

```tsx live file="$DOCS/learn/rows/custom-rendering-for-disabled-rows-example.page.tsx"

```

</Sandpack>

## Toggle disabled rows from user actions

For interactive workflows, use the DataSource API. The two most direct methods
are <DApiLink name="setRowEnabled" /> and <DApiLink name="setRowEnabledAt" />:

```ts
dataSourceApi.setRowEnabled(rowId, enabled);
dataSourceApi.setRowEnabledAt(rowIndex, enabled);
```

The id-based method is usually the better default because it follows your
primary key. The index-based method is handy when your interaction already works
with the current row position.

<Sandpack title="Enable and disable rows from the context menu" size="md" viewMode="preview">

<Description>

Right click a row and use the context menu to enable, disable, or toggle that
row. The example also exposes buttons for enabling or disabling all rows.

</Description>

```tsx live file="$DOCS/learn/rows/using-api-to-disable-rows-example.page.tsx"

```

</Sandpack>

## Where disabled rows help

Reach for disabled rows when the record should remain visible but should not
participate in the current action:

- an approval grid where already-approved rows stay visible for context
- a billing grid where void invoices are read-only
- a permissions editor where inherited permissions cannot be changed locally
- a scheduling grid where booked resources are visible but unavailable
- a bulk-selection UI where some rows are outside the current operation

One important boundary: disabled rows are a UI affordance, not an authorization
system. Keep enforcing write permissions on the server. In the DataGrid, use
disabled rows to make the allowed action obvious before the user tries it.

## Go deeper in the docs

- [Disabled rows](/docs/learn/rows/disabled-rows) - the feature guide and demos
- <DPropLink name="defaultRowDisabledState" /> and
  <DPropLink name="rowDisabledState" /> - uncontrolled and controlled state
- <DPropLink name="isRowDisabled" /> - rule-based disabled rows
- <DApiLink name="setRowEnabled" /> and <DApiLink name="setRowEnabledAt" /> -
  programmatic updates through the DataSource API
