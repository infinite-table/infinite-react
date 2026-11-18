---
title: Disable rows in a React DataGrid without scattering guard logic
description: Use Infinite Table disabled rows to make specific records unavailable for selection, clicks, keyboard navigation, and custom interactions from one DataSource state model.
date: 2026-10-01
author: radu
tags: rows, disabled-rows, react-datagrid
---

Some rows in a data grid should be visible but unavailable for interaction.
Archived invoices, locked accounts, imported records that failed validation, summary rows, or items owned by another team can all belong in the same view as active records, while still being excluded from selection and actions.

The [disabled rows docs](/docs/learn/rows/disabled-rows) cover this exact case in Infinite Table. Instead of adding custom checks to every click handler, checkbox, context menu, and keyboard shortcut, you describe the disabled state once on `<DataSource />`.

## Disabled is interaction state, not display state

A disabled row still renders in the DataGrid. The difference is how Infinite Table treats it for user interaction:

- it is not selectable
- it is not clickable
- it is skipped by keyboard navigation
- row-aware UI can read the same disabled state while rendering

That makes disabled rows useful when a row still needs to provide context, but should not be acted on.

For example, a review queue might show every submitted record, while disabling the ones that are already approved. A billing grid might show locked invoices so totals still make sense, while preventing users from selecting or editing them.

## Start with an initial disabled state

The simplest setup is <DataSourcePropLink name="defaultRowDisabledState" />. It is the uncontrolled version of row disabled state, and it belongs on `<DataSource />` because disabled rows are part of the data interaction model.

```tsx
<DataSource
  primaryKey="id"
  data={data}
  defaultRowDisabledState={{
    enabledRows: true,
    disabledRows: [1, 3, 4, 5],
  }}
>
  <InfiniteTable columns={columns} keyboardNavigation="row" />
</DataSource>
```

In this shape, `enabledRows: true` means all rows are enabled by default, while `disabledRows` lists the primary keys that should be disabled.

<Sandpack title="Initial disabled rows" size="md" viewMode="preview">

<Description>

This docs example starts with a few developer rows disabled. Try selecting rows or navigating with the keyboard to see how disabled rows are skipped.

</Description>

```tsx live file="$DOCS/learn/rows/initialRowDisabledState-example.page.tsx"

```

</Sandpack>

You can invert the state too. If most rows should be unavailable, set `disabledRows: true` and list exceptions with `enabledRows`.

```tsx
defaultRowDisabledState={{
  enabledRows: [1, 2, 3, 5],
  disabledRows: true,
}}
```

Use the shape that matches your domain. An approvals screen often starts with everything enabled except completed records. A restricted admin screen might start with everything disabled except records the current user can manage.

## Keep rendering in sync with row state

Disabled rows should usually look different. The important part is to render from the same state the grid uses for interaction, not from a duplicate local rule.

Cell renderers receive `rowInfo`, and `rowInfo.rowDisabled` tells you whether the current row is disabled.

```tsx {3}
const columns = {
  firstName: {
    field: 'firstName',
    renderValue: ({ rowInfo, value }) => {
      return rowInfo.rowDisabled ? `${value} (locked)` : value;
    },
  },
};
```

That keeps the visual treatment honest. If the row becomes enabled later, the cell renderer updates from the same source of truth.

<Sandpack title="Render disabled row state in cells" size="md" viewMode="preview">

<Description>

This docs example reads `rowInfo.rowDisabled` while rendering a cell, and exposes buttons that enable or disable all rows through the DataSource API.

</Description>

```tsx live file="$DOCS/learn/rows/custom-rendering-for-disabled-rows-example.page.tsx"

```

</Sandpack>

## Change disabled rows from the DataSource API

Rows often become enabled or disabled after the grid is already mounted. A workflow action might lock a record, a permission change might unlock a row, or a context menu might let an admin toggle availability.

Use the DataSource API for those updates:

```tsx
dataSourceApi.setRowEnabled(rowId, enabled);
```

When you already have the row index, use <DApiLink name="setRowEnabledAt" />:

```tsx
dataSourceApi.setRowEnabledAt(rowIndex, enabled);
```

The docs example below wires those calls into row context menu actions.

<Sandpack title="Enable and disable rows from a context menu" size="md" viewMode="preview">

<Description>

Open a row context menu and toggle its disabled state. The menu actions call `setRowEnabled` and `setRowEnabledAt` on the DataSource API.

</Description>

```tsx live file="$DOCS/learn/rows/using-api-to-disable-rows-example.page.tsx"

```

</Sandpack>

## Controlled state and business rules

When another part of your app owns the disabled state, use <DataSourcePropLink name="rowDisabledState" /> and <DataSourcePropLink name="onRowDisabledStateChange" /> as the controlled pair.

When the rule is derived from data or permissions, use <DataSourcePropLink name="isRowDisabled" />. The docs call out that `isRowDisabled` is the final override: if you provide it, that function decides whether a row is disabled.

That gives you three levels of control:

- <DataSourcePropLink name="defaultRowDisabledState" /> for simple initial state
- <DataSourcePropLink name="rowDisabledState" /> for controlled app state
- <DataSourcePropLink name="isRowDisabled" /> for derived rules

Pick the one that reflects where the truth lives.

## Why this belongs in the grid

You can always write guards in your own click handlers, but that leaves gaps. Selection, keyboard navigation, row menus, and custom renderers all need to agree.

Disabled rows make that agreement explicit. The DataSource owns which rows are enabled, the grid applies that state to built-in interactions, and your rendering code can read the same `rowInfo.rowDisabled` value when it needs to communicate why a row is unavailable.

Start with the [disabled rows docs](/docs/learn/rows/disabled-rows), then adapt the initial state or API calls to the workflow your grid needs to protect.
