---
title: Disable rows in your React DataGrid without losing context
description: Use Infinite Table disabled rows to keep records visible while removing them from selection, clicks, and keyboard navigation.
date: 2026-07-16
author: radu
tags: rows, datasource, keyboard-navigation
---

Sometimes a row should stay visible even when users should not interact with it.

Think of archived invoices, locked workflow steps, read-only audit entries, expired offers, or records a user can see but cannot act on. Filtering those rows away hides important context. Styling them only as muted still leaves them selectable, clickable, and reachable with the keyboard.

Infinite Table's [disabled rows docs](/docs/learn/rows/disabled-rows) cover the feature in detail. This article focuses on the practical pattern: let the `DataSource` own which rows are disabled, and let the grid automatically respect that state across row selection, pointer interaction, and keyboard navigation.

## Disabled rows are a data state

Disabled rows are configured on `<DataSource />`, not as one-off CSS on `<InfiniteTable />`. That matters because the disabled state affects interaction, not just rendering.

The uncontrolled version uses <DataSourcePropLink name="defaultRowDisabledState" />.

```tsx
<DataSource<Developer>
  primaryKey="id"
  data={data}
  defaultRowDisabledState={{
    enabledRows: true,
    disabledRows: [1, 3, 4, 5],
  }}
>
  <InfiniteTable<Developer>
    columns={columns}
    keyboardNavigation="row"
  />
</DataSource>
```

This means every row is enabled by default except the rows with ids `1`, `3`, `4`, and `5`.

You can also flip the model when the blocked state is the common case:

```tsx
defaultRowDisabledState={{
  enabledRows: [1, 2, 3, 5],
  disabledRows: true,
}}
```

That shape is useful for permission-driven screens where most records are locked and only a smaller allow-list should stay interactive.

## See initial disabled rows in action

The docs example below starts with a few disabled rows and enables row keyboard navigation so the difference is easy to test.

<Sandpack title="Initial disabled row state" size="md" viewMode="preview">

<Description>

Click the grid and navigate with the keyboard. Disabled rows remain visible, but they are skipped by row navigation and interaction.

</Description>

```tsx live file="$DOCS/learn/rows/initialRowDisabledState-example.page.tsx"

```

</Sandpack>

## Render the disabled state where it helps users

Once the `DataSource` knows which rows are disabled, your cell renderers can read that state from `rowInfo.rowDisabled`.

```tsx
const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    renderValue: ({ rowInfo, value }) => {
      return `${value} ${rowInfo.rowDisabled ? 'disabled' : ''}`;
    },
  },
};
```

That gives you one source of truth for both behavior and presentation. You can dim a row, add a label, show a lock icon, or change the available row actions without duplicating permission logic in every component.

<Sandpack title="Render disabled rows differently" size="md" viewMode="preview">

<Description>

This example uses `rowInfo.rowDisabled` while rendering the `firstName` column, and includes buttons for enabling or disabling all rows.

</Description>

```tsx live file="$DOCS/learn/rows/custom-rendering-for-disabled-rows-example.page.tsx"

```

</Sandpack>

## Change row availability at runtime

Disabled state often changes after the grid is mounted. A review queue can unlock a record. A batch operation can mark records as unavailable. A context menu can give admins a quick toggle.

Use the <DApiLink name="setRowEnabled" /> and <DApiLink name="setRowEnabledAt" /> methods from the `DataSource` API for those cases.

```tsx
dataSourceApi.setRowEnabled(rowId, true);
dataSourceApi.setRowEnabledAt(rowIndex, false);
```

The id-based version is usually the clearest option when you are responding to app data. The index-based version is useful when the action comes from the current rendered row position.

The docs example below wires this into a row context menu:

<Sandpack title="Toggle disabled rows with the DataSource API" size="md" viewMode="preview">

<Description>

Right-click a row to open the context menu, then enable, disable, or toggle that row. The menu actions call the DataSource API.

</Description>

```tsx live file="$DOCS/learn/rows/using-api-to-disable-rows-example.page.tsx"

```

</Sandpack>

## When this is better than filtering

Reach for disabled rows when users still need to understand why a record is present, but should not be able to act on it.

Good examples include:

- rows locked by permissions
- archived or expired records kept for reference
- rows already included in another workflow step
- pending records waiting for validation
- inventory items temporarily unavailable for selection

Filtering is still the right tool when the row should disappear from the current view. Disabled rows are better when the row is part of the story, but not part of the action.

## Go deeper in the docs

Start with the [disabled rows guide](/docs/learn/rows/disabled-rows) for the complete setup.

If the disabled state is derived from your own rules, check <DataSourcePropLink name="isRowDisabled" />. It lets you calculate row availability from the row data and can override the configured disabled-row state.

For runtime changes, use the [DataSource API reference](/docs/reference/datasource-api) alongside the disabled rows examples.
