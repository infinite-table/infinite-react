---
title: Command-style keyboard shortcuts for your React DataGrid
description: Use Infinite Table keyboard shortcuts to add product-specific commands, context-aware handlers, and spreadsheet-like instant editing to your React DataGrid.
date: 2026-08-22
author: radu
tags: keyboard-navigation, keyboard-shortcuts, react-datagrid
---

Dense data apps usually end up with two interaction models.

There is the visible UI: buttons, menus, filters, column headers, and context menus. Then there is the power-user layer: jump to the next exception, open the selected account, approve a row, start editing, copy an identifier, or trigger the same command an action menu would expose.

Infinite Table's [keyboard shortcuts docs](/docs/learn/keyboard-navigation/keyboard-shortcuts) give that second layer a first-class API. You can define shortcuts on the grid, decide when each one applies, and use the table and data source APIs from the handler.

## Start with a shortcut object

The <PropLink name="keyboardShortcuts" /> prop receives an array of shortcut definitions.

```tsx
<InfiniteTable
  columns={columns}
  keyboardShortcuts={[
    {
      key: 'Shift+Enter',
      when: ({ getState }) => !!getState().activeCellIndex,
      handler: ({ getState }) => {
        const [rowIndex, columnIndex] = getState().activeCellIndex!;

        console.log(`Active cell: ${rowIndex}, ${columnIndex}`);
      },
    },
  ]}
/>
```

Each shortcut has three important parts:

- `key` - the key or key combination to listen for
- `when` - an optional predicate that decides whether the shortcut is active
- `handler` - the command to run when the shortcut matches

The key syntax is intentionally close to what users already know from desktop software and editors: `Enter`, `Escape`, `PageDown`, `Ctrl+x`, `Cmd+Shift+e`, or platform-aware combinations such as `Cmd|Ctrl+Shift+Enter`.

## Make the grid feel like the rest of your product

Shortcut handlers receive the same kind of context you need for product commands:

- `api` - the Infinite Table API
- `dataSourceApi` - the DataSource API
- `getState` - current grid state
- `getDataSourceState` - current data source state

That means a shortcut can inspect the active cell, read the current row, open a side panel, toggle a detail view, update data, or coordinate with app-level state.

For example, a customer-support grid might use shortcuts like:

```tsx
const keyboardShortcuts = [
  {
    key: 'Enter',
    when: ({ getState }) => !!getState().activeCellIndex,
    handler: ({ getState }) => {
      const [rowIndex] = getState().activeCellIndex!;

      openTicketAtRow(rowIndex);
    },
  },
  {
    key: 'Cmd|Ctrl+Shift+a',
    handler: ({ getDataSourceState }) => {
      const state = getDataSourceState();

      assignVisibleTickets(state);
    },
  },
];
```

The grid does not need to own every product behavior. It gives the shortcut handler table-aware context, and your app decides what the command means.

## Keep shortcuts context-aware with `when`

The `when` callback is what separates a useful shortcut from a global key trap.

You can restrict a command to moments where it makes sense:

- only when a cell is active
- only when a selected row is editable
- only when the grid is not already editing
- only when a certain column is focused
- only when the current data source state allows the operation

```tsx
const approveShortcut = {
  key: 'a',
  when: ({ getState, dataSourceApi }) => {
    const { activeCellIndex } = getState();

    if (!activeCellIndex) {
      return false;
    }

    const [rowIndex] = activeCellIndex;
    const rowInfo = dataSourceApi.getRowInfoByIndex(rowIndex);

    return rowInfo?.data?.status === 'pending';
  },
  handler: ({ getState }) => {
    const [rowIndex] = getState().activeCellIndex!;

    approveRowAt(rowIndex);
  },
};
```

This pattern matters in admin tools, finance dashboards, approval queues, and developer tools. The shortcut layer should be fast, but it should still respect the same business rules as the visible UI.

<Sandpack title="Custom DataGrid keyboard shortcuts" size="md" viewMode="preview">

<Description>

Click a cell, then press `Shift+Enter` to run a shortcut that reads the active cell from grid state. The full example comes from the keyboard shortcuts docs.

</Description>

```tsx live file="$DOCS/reference/keyboard-shortcuts-initial-example.page.tsx"

```

</Sandpack>

## Use instant edit for spreadsheet-like typing

Some shortcuts are common enough that Infinite Table ships them as predefined helpers. The first one is <PropLink name="keyboardShortcuts" code={false}>`keyboardShortcuts.instantEdit`</PropLink>.

Import it from `@infinite-table/infinite-react`, enable editable columns, and add it to the grid:

```tsx {4,10}
import {
  DataSource,
  InfiniteTable,
  keyboardShortcuts,
} from '@infinite-table/infinite-react';

<DataSource primaryKey="id" data={dataSource}>
  <InfiniteTable
    columns={columns}
    columnDefaultEditable
    keyboardShortcuts={[keyboardShortcuts.instantEdit]}
  />
</DataSource>;
```

With `instantEdit`, typing while a cell is active starts cell editing immediately. It is the interaction users expect from Excel and Google Sheets: navigate to a cell, type, and replace the value without reaching for the mouse or pressing an extra edit button.

<Sandpack title="Instant edit keyboard shortcut" size="md" viewMode="preview">

<Description>

Click a cell and start typing. The predefined `keyboardShortcuts.instantEdit` helper starts editing from the first key press.

</Description>

```tsx live file="$DOCS/reference/keyboard-shortcuts-instant-edit-example.page.tsx"

```

</Sandpack>

## Good shortcut candidates

Keyboard shortcuts are best when they shorten repeated, high-confidence actions. They are not a replacement for visible UI, but they make the visible UI feel faster once users understand the workflow.

Good DataGrid shortcuts include:

- open the current row or active cell details
- start editing or cancel editing
- approve, reject, archive, or assign a selected item
- jump to the next invalid row
- toggle row detail for the active row
- copy a domain-specific identifier
- expand or collapse grouped/tree rows
- focus a filter, command palette, or side panel

For teams building internal tools, this is often the difference between a grid that displays data and a grid that feels like an application.

## Design shortcuts as part of the command model

The cleanest setup is to treat keyboard shortcuts as another way to trigger existing commands.

If your UI already has an "Approve" menu item, the shortcut handler should call the same command function. If permissions or row state can disable the menu item, the `when` callback should reuse that same condition. If the command updates server state, keep that logic outside the shortcut definition and let the shortcut supply grid context.

That keeps the keyboard layer small:

```tsx
const approveCurrentRowShortcut = {
  key: 'Cmd|Ctrl+Enter',
  when: ({ getState }) => canApproveActiveRow(getState()),
  handler: ({ getState }) => approveActiveRow(getState()),
};
```

The shortcut describes discoverability and context. The command owns behavior.

## Go deeper in the docs

Start with the [keyboard shortcuts docs](/docs/learn/keyboard-navigation/keyboard-shortcuts) for the shortcut object shape, supported key syntax, `when` predicates, and predefined helpers.

If you are building a spreadsheet-style grid, continue with [inline editing](/docs/learn/editing/inline-editing), [Excel-like editing](/docs/learn/editing/excel-like-editing), and [cell navigation](/docs/learn/keyboard-navigation/navigating-cells). Together, those features let users move through the grid, edit values, and trigger product commands without leaving the keyboard.
