---
title: Keyboard shortcuts for React DataGrids that feel native
description: Use Infinite Table keyboard shortcuts to add product-specific commands, active-cell actions, and spreadsheet-style instant edit to your React DataGrid.
date: 2026-08-07
author: radu
tags: keyboard-shortcuts, keyboard-navigation, react-datagrid
---

Great data-heavy apps usually grow keyboard workflows.

Analysts want to open a record without reaching for the mouse. Support agents want to claim the current ticket. Operators want to mark an item as reviewed, move to the next row, and keep going. If your DataGrid is central to the workflow, keyboard shortcuts stop being a nice-to-have and become part of the product UI.

Infinite Table already has [keyboard navigation](/docs/learn/keyboard-navigation/navigating-cells) for moving around cells and rows. The [keyboard shortcuts docs](/docs/learn/keyboard-navigation/keyboard-shortcuts) build on that by letting you define custom commands that know about the current grid state and the DataSource.

## Define commands close to the grid

Keyboard shortcuts are configured with the <PropLink name="keyboardShortcuts" /> prop on `<InfiniteTable />`.

Each shortcut has three parts:

- `key` - the key or key combination that should trigger the command
- `when` - an optional guard that decides if the shortcut is active
- `handler` - the command to run when the shortcut matches

```tsx
const keyboardShortcuts = [
  {
    key: 'Shift+Enter',
    when: ({ getState }) => !!getState().activeCellIndex,
    handler: ({ getState }) => {
      const [rowIndex, columnIndex] = getState().activeCellIndex!;

      console.log(`Open row ${rowIndex}, column ${columnIndex}`);
    },
  },
];

<InfiniteTable columns={columns} keyboardShortcuts={keyboardShortcuts} />;
```

The shortcut handler receives the same kind of context you usually need when building app-level grid commands:

- `api` - the Infinite Table API
- `dataSourceApi` - the DataSource API
- `getState` - a function that returns the current grid state
- `getDataSourceState` - a function that returns the current DataSource state

That means the shortcut can read the active cell, inspect selection, call grid APIs, update row data, open a side panel, or hand control to the rest of your application.

## Use shortcut syntax users already understand

The `key` format follows the convention users already recognize from tools like VS Code and desktop apps.

```tsx
const keyboardShortcuts = [
  { key: 'Enter', handler: openCurrentRow },
  { key: 'Delete', handler: deleteSelectedRows },
  { key: 'Cmd|Ctrl+k', handler: openCommandPalette },
  { key: 'Alt+Shift+Enter', handler: openDetailsInNewPanel },
];
```

The cross-platform `Cmd|Ctrl` modifier is especially useful for product shortcuts. You can define one command and have it map to `Cmd` on macOS and `Ctrl` on Windows/Linux.

Special keys such as `ArrowUp`, `ArrowDown`, `PageUp`, `PageDown`, `Escape`, `Delete`, `Insert`, `F1`, and `F2` are supported. The docs also call out `*`, which matches any key press. That is useful when you want to start an interaction from normal typing instead of from a named command.

## Keep commands state-aware with `when`

The `when` guard is where shortcuts start to feel like part of the DataGrid instead of a global document listener.

For example, a command that opens the active cell only makes sense when there is an active cell. A command that archives selected rows only makes sense when selection is not empty. A command that expands a grouped row should not run on a leaf row.

```tsx
const openActiveCellShortcut = {
  key: 'Shift+Enter',
  when: ({ getState }) => !!getState().activeCellIndex,
  handler: ({ getState }) => {
    const { activeCellIndex } = getState();

    if (!activeCellIndex) {
      return;
    }

    const [rowIndex, columnIndex] = activeCellIndex;
    openCellInspector({ rowIndex, columnIndex });
  },
};
```

Both `when` and `handler` can be async, so you can ask the application whether a command is currently allowed before running it.

<Sandpack title="Custom DataGrid keyboard shortcuts" size="md" viewMode="preview">

<Description>

Click a cell and press `Shift+Enter` to trigger a custom shortcut that reads the active cell position.

</Description>

```tsx live file="$DOCS/reference/keyboard-shortcuts-initial-example.page.tsx"

```

</Sandpack>

## Combine shortcuts with built-in navigation

Keyboard shortcuts do not replace regular grid navigation. They sit on top of it.

By default, Infinite Table uses cell keyboard navigation. Users can click a cell and then move with arrow keys, `PageUp`, `PageDown`, `Home`, and `End`. You can also switch to row navigation with <PropLink name="keyboardNavigation">keyboardNavigation="row"</PropLink>, or disable keyboard navigation for screens where a different interaction model is needed.

That split is useful because navigation and actions are different concepts:

- navigation decides where the active cell or row is
- shortcuts decide what command should run from that position

For grouped data, built-in keyboard behavior already covers common actions. Pressing `Enter` on a group row toggles it, and row-navigation mode also lets users collapse and expand groups with left and right arrows.

<Sandpack title="Toggle grouped rows with the keyboard" size="md" viewMode="preview">

<Description>

Move to a grouped row and press `Enter` to toggle it. The active cell can be in any column on that group row.

</Description>

```tsx live file="$DOCS/reference/keyboard-toggle-group-rows-cell-nav.page.tsx"

```

</Sandpack>

## Add spreadsheet-style instant edit

Some keyboard workflows are so common that they should not be custom every time.

Infinite Table exports predefined shortcuts from the `keyboardShortcuts` named export. The most useful one for editing-heavy grids is `keyboardShortcuts.instantEdit`.

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

With instant edit enabled, typing while a cell is active starts editing that cell, similar to Excel or Google Sheets. For internal tools, inventory screens, finance grids, and admin workflows, that removes a lot of click friction.

<Sandpack title="Instant edit with keyboard shortcuts" size="md" viewMode="preview">

<Description>

Click a cell and start typing. The predefined `keyboardShortcuts.instantEdit` shortcut starts editing the active editable cell.

</Description>

```tsx live file="$DOCS/reference/keyboard-shortcuts-instant-edit-example.page.tsx"

```

</Sandpack>

## Product shortcuts worth adding

Once navigation and editing are covered, product-specific shortcuts become easier to reason about.

Here are a few patterns that map well to DataGrid screens:

- **Open the current record** - `Enter` or `Shift+Enter` opens a details panel for the active row.
- **Edit the current cell** - `F2` starts a richer editor, while normal typing can use `keyboardShortcuts.instantEdit`.
- **Apply a workflow action** - `a` assigns a ticket, `r` marks a review as complete, `s` stars an account.
- **Bulk action selected rows** - `Cmd|Ctrl+Enter` applies an action to the current selection.
- **Open a command palette** - `Cmd|Ctrl+k` keeps app-wide commands close to the grid.
- **Escape local UI** - `Escape` closes an editor, drawer, menu, or details panel before focus leaves the grid.

The important part is that these commands can stay state-aware. A shortcut can inspect the active cell, current row selection, grouping state, or DataSource state before deciding what to do.

## When keyboard shortcuts are a good fit

Reach for DataGrid keyboard shortcuts when the grid is the work surface, not just a table of results.

Good examples include:

- operations dashboards where users triage records quickly
- support queues with claim, assign, and resolve actions
- spreadsheet-like editing screens
- analytics tools with cell inspectors or drill-down panels
- admin tools where power users repeat the same row actions all day

Start with the [keyboard shortcuts guide](/docs/learn/keyboard-navigation/keyboard-shortcuts), then pair it with the [cell navigation](/docs/learn/keyboard-navigation/navigating-cells), [row navigation](/docs/learn/keyboard-navigation/navigating-rows), and [Keyboard Navigation API](/docs/reference/keyboard-navigation-api) docs depending on how much control your app needs.
