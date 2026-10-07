---
title: Disabling rows in React DataGrids
description: Keep rows visible while making them non-interactive with Infinite Table disabled rows, including initial state, rendering, keyboard navigation, and DataSource API updates.
date: 2026-10-07
author: radu
tags: rows, keyboard-navigation, row-selection
---

Sometimes a row should stay visible without behaving like a normal row.

Think about locked invoices, archived users, products that are temporarily unavailable, workflow steps the current user cannot act on, or records that failed validation. Hiding those rows can remove important context. Leaving them fully interactive can create bad states: the user can select them, edit them, open menus, or navigate to actions that should not run.

Infinite Table's [Disabled Rows docs](/docs/learn/rows/disabled-rows) cover this middle ground. A disabled row remains in the DataGrid, but it is removed from the normal interaction model: it is not selectable, not clickable, not reachable through keyboard navigation, and it can be styled differently while still preserving the surrounding data context.

## Disable rows at the DataSource level

Row disabled state belongs to `<DataSource />`, not to a cell renderer.

That matters because the disabled state affects more than visuals. The `DataSource` knows row ids, selection state, keyboard navigation, and the APIs that can change row state later. If you only dim a row in CSS, the grid still treats it as interactive. If you use <DPropLink name="defaultRowDisabledState" />, <DPropLink name="rowDisabledState" />, or <DPropLink name="isRowDisabled" />, the grid can apply the rule consistently.

For an initial uncontrolled value, pass <DPropLink name="defaultRowDisabledState" />:

```tsx
<DataSource<Developer>
  data={data}
  primaryKey="id"
  defaultRowDisabledState={{
    enabledRows: true,
    disabledRows: [1, 3, 4, 5],
  }}
>
  <InfiniteTable<Developer> columns={columns} keyboardNavigation="row" />
</DataSource>
```

The shape is intentionally an include/exclude model:

- `enabledRows: true` plus `disabledRows: [...]` means every row is enabled except the listed row ids.
- `disabledRows: true` plus `enabledRows: [...]` means every row is disabled except the listed row ids.

Those arrays contain row ids, not row indexes. That is the right default for production grids because sorting, filtering, lazy loading, and pagination can all move rows around. A row id keeps the rule attached to the record.

<Sandpack title="Specify rows as initially disabled" size="md" viewMode="preview">

<Description>

Rows with ids 1, 3, 4, and 5 are disabled through `defaultRowDisabledState`.

</Description>

```tsx live file="$DOCS/learn/rows/initialRowDisabledState-example.page.tsx"

```

</Sandpack>

## Choose the state model that matches the product rule

There are three common ways to decide whether a row is disabled.

### 1. Start with an uncontrolled value

Use <DPropLink name="defaultRowDisabledState" /> when the DataGrid can own the state after the initial render.

This is a good fit for local tools, admin screens, and workflows where the user can enable or disable rows while they work. You provide the initial state, then the DataSource API can mutate it.

### 2. Control the state from your app

Use <DPropLink name="rowDisabledState" /> together with <DPropLink name="onRowDisabledStateChange" /> when the disabled state is part of application state.

That is useful when the row state needs to be saved, shared across grids, synchronized with URL state, or confirmed by a server. The grid reports changes through the callback, and your app passes the next value back in.

### 3. Derive it from row data

Use <DPropLink name="isRowDisabled" /> when the disabled state is a rule, not user-editable state.

```tsx
<DataSource<Invoice>
  data={data}
  primaryKey="id"
  isRowDisabled={(rowInfo) => rowInfo.data?.status === 'locked'}
>
  <InfiniteTable<Invoice> columns={columns} />
</DataSource>
```

For example:

- disable invoices with `status === 'locked'`
- disable users where `role === 'owner'`
- disable rows the current user cannot update
- disable records that are already archived

Because <DPropLink name="isRowDisabled" /> is the final decision point, it overrides both <DPropLink name="defaultRowDisabledState" /> and <DPropLink name="rowDisabledState" />. Use it for pure derived rules, not for state you expect users to toggle through the API.

## Render disabled rows with intent

Disabled rows should be visually clear, but they should not disappear.

Every cell renderer gets row information, and <TypeLink name="InfiniteTableRowInfo" /> includes `rowDisabled`. That lets you render an icon, show explanatory text, reduce emphasis, or replace an action with a locked state.

```tsx
const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    renderValue: ({ rowInfo, value }) => {
      return rowInfo.rowDisabled ? `${value} (disabled)` : value;
    },
  },
};
```

This is where product details belong:

- show "Archived" next to archived records
- show "Locked" next to rows waiting for approval
- explain why a workflow step cannot be selected
- hide or disable row-level actions that would fail

<Sandpack title="Render disabled rows differently" size="md" viewMode="preview">

<Description>

The `firstName` column reads `rowInfo.rowDisabled` and adds a visual marker for disabled rows.

</Description>

```tsx live file="$DOCS/learn/rows/custom-rendering-for-disabled-rows-example.page.tsx"

```

</Sandpack>

## Toggle disabled rows from user actions

Some screens need a row to become enabled or disabled after the grid has already rendered. Maybe a context menu locks a record. Maybe a bulk action disables every row except a selected subset. Maybe a validation result comes back from the server and the row should stop accepting interactions.

The `DataSourceApi` exposes row-level methods for this:

```tsx
dataSourceApi.setRowEnabled(rowId, enabled);
dataSourceApi.setRowEnabledAt(rowIndex, enabled);
```

Use <DApiLink name="setRowEnabled" /> when you know the row id. Use <DApiLink name="setRowEnabledAt" /> when you are responding to a rendered row index, such as a context menu opened from a specific row.

The docs example wires those methods into row context-menu actions:

<Sandpack title="Enable and disable rows from the API" size="md" viewMode="preview">

<Description>

Right click a row and use the context menu to enable, disable, or toggle that row.

</Description>

```tsx live file="$DOCS/learn/rows/using-api-to-disable-rows-example.page.tsx"

```

</Sandpack>

## Why this beats ad-hoc row guards

Without a first-class disabled-row model, the same rule tends to leak into many places:

- the row renderer needs a dimmed style
- the selection handler needs to reject the row
- keyboard navigation needs to skip it
- context menus need disabled actions
- edit handlers need extra checks
- bulk actions need to filter it out

That duplication is easy to get wrong. One missed guard can leave a supposedly locked row interactive through a different path.

Putting the rule in `DataSource` gives the grid one source of truth. Renderers can still choose how to communicate the state, but selection, click handling, keyboard navigation, and API updates can all ask the same question: is this row disabled?

## When disabled rows are the right fit

Use disabled rows when the user still needs to see the record but should not act on it.

Good examples include:

- archived records in an admin grid
- locked billing documents
- rows the current role cannot modify
- workflow steps that are waiting on another dependency
- imported records that failed validation
- inventory rows that are temporarily unavailable

If the row is irrelevant, filter it out. If the row is relevant but unavailable, disable it.

Start with the [Disabled Rows guide](/docs/learn/rows/disabled-rows), then decide whether your product needs an initial uncontrolled value, controlled state, or a derived `isRowDisabled` rule.
