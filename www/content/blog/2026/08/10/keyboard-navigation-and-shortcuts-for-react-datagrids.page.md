---
title: Keyboard navigation and shortcuts for React DataGrids
description: Use Infinite Table keyboard navigation, custom shortcuts, instant edit, and the Keyboard Navigation API to make React DataGrids feel fast without hand-rolled focus state.
date: 2026-08-10
author: radu
tags: keyboard-navigation, keyboard-shortcuts, react-datagrid
---

Keyboard support is one of those features users notice most when it is missing.

A data grid can render thousands of rows, virtualize columns, and fetch data on demand, but if analysts still have to reach for the mouse after every cell, the workflow feels slower than it should. Infinite Table's [keyboard navigation docs](/docs/learn/keyboard-navigation/navigating-cells) cover the building blocks for making a React DataGrid feel closer to a desktop tool: active cells, row or cell navigation, keyboard selection, custom shortcuts, and an imperative API when surrounding UI needs to move focus.

This article maps those docs to product scenarios and shows where each layer fits.

## Start with cell navigation

Cell navigation is enabled by default. Once a user clicks a cell, Infinite Table tracks an active cell and lets the user move with the keyboard.

```tsx
<InfiniteTable keyboardNavigation="cell" />
```

The value can be:

- `"cell"` - navigate individual cells, which is the default
- `"row"` - navigate rows as the active unit
- `false` - disable built-in keyboard navigation

The default cell mode covers spreadsheet-style movement:

- `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` move one cell
- `PageUp` and `PageDown` move vertically by the visible row count
- `Shift+PageUp` and `Shift+PageDown` move horizontally by the visible column count
- `Home` and `End` jump vertically
- `Shift+Home` and `Shift+End` jump across the current row

<Sandpack title="Cell keyboard navigation" size="md" viewMode="preview">

<Description>

Click a cell, then use the arrow keys, page keys, Home, and End to move around the grid.

</Description>

```tsx live file="$DOCS/learn/keyboard-navigation/navigating-cells-initial-example.page.tsx"

```

</Sandpack>

That matters because focus state is not only a visual detail. It becomes the anchor for shortcuts, editing, selection, and action bars.

## Pick an intentional starting point

For workflows that open a grid with a known starting position, use <PropLink name="defaultActiveCellIndex" />.

```tsx
<InfiniteTable defaultActiveCellIndex={[2, 0]} />
```

The tuple is zero-based: `[rowIndex, columnIndex]`. In the example above, the third row and first column start active.

Use the controlled pair <PropLink name="activeCellIndex" /> and <PropLink name="onActiveCellIndexChange" /> when another part of the app owns that state. For example, a side panel might show details for the active row, or a wizard might advance the user through required cells.

```tsx
const [activeCellIndex, setActiveCellIndex] = React.useState<[number, number]>([
  2, 0,
]);

<InfiniteTable
  activeCellIndex={activeCellIndex}
  onActiveCellIndexChange={setActiveCellIndex}
/>;
```

When using a controlled active cell, always update the value from <PropLink name="onActiveCellIndexChange" />. Otherwise the user can press a key, Infinite Table can request the new position, but the controlled prop will keep rendering the old one.

## Let selection follow the keyboard

Keyboard navigation becomes more useful when it coordinates with row selection.

With multiple row selection enabled on the `<DataSource />`, users can press Space to select the active row. The same modifier model from mouse interaction applies: Space plus `cmd`/`ctrl`/`shift` behaves like clicking with those modifiers.

```tsx
<DataSource selectionMode="multi-row" />
```

By default, <PropLink name="keyboardSelection" /> is enabled. That gives users a predictable way to move, select, extend, and review a set of rows without leaving the keyboard. `cmd`/`ctrl` + `A` selects all rows.

For grouped grids, keyboard navigation also understands group rows. Pressing `Enter` while the active row is a group row toggles that group, even when the active cell is not in the group column.

<Sandpack title="Toggle grouped rows from the keyboard" size="md" viewMode="preview">

<Description>

Move to a group row and press Enter to expand or collapse it.

</Description>

```tsx live file="$DOCS/reference/keyboard-toggle-group-rows-cell-nav.page.tsx"

```

</Sandpack>

That keeps a grouped report navigable as a keyboard-first interface, not only as a collapsible mouse UI.

## Add product-specific shortcuts

The [keyboard shortcuts docs](/docs/learn/keyboard-navigation/keyboard-shortcuts) add a higher-level layer: define custom actions in the grid itself.

A shortcut has three pieces:

```tsx
{
  key: string;
  when?: (context) => boolean | Promise<boolean>;
  handler: (context, event) => void | Promise<void>;
}
```

The `key` syntax is intentionally familiar. You can use single keys, combinations such as `Cmd|Ctrl+Shift+Enter`, special keys such as `Delete` or `PageDown`, and the `Cmd|Ctrl` alias to support Mac and Windows/Linux with one definition.

The `when` function is the guardrail. It lets a shortcut be global to the grid but specific to a state:

```tsx
keyboardShortcuts={[
  {
    key: 'Shift+Enter',
    when: (context) => !!context.getState().activeCellIndex,
    handler: (context) => {
      const [rowIndex, columnIndex] = context.getState().activeCellIndex!;

      alert(`Current active cell: row ${rowIndex}, column ${columnIndex}.`);
    },
  },
]}
```

The context passed to `when` and `handler` gives access to:

- `api` - the Infinite Table API
- `dataSourceApi` - the DataSource API
- `getState` - current grid state
- `getDataSourceState` - current DataSource state

<Sandpack title="Custom keyboard shortcuts" size="md" viewMode="preview">

<Description>

Click a cell and press Shift+Enter to run a shortcut that reads the active cell position.

</Description>

```tsx live file="$DOCS/reference/keyboard-shortcuts-initial-example.page.tsx"

```

</Sandpack>

In a real product, the handler could open a command palette, approve the selected rows, copy an audit id, jump to a related record, or start an inline workflow.

## Make editing feel like a spreadsheet

One predefined shortcut is especially useful for data-entry screens: <PropLink name="keyboardShortcuts" code={false}>`keyboardShortcuts.instantEdit`</PropLink>.

```tsx
import { keyboardShortcuts } from '@infinite-table/infinite-react';

<InfiniteTable
  columnDefaultEditable
  columns={columns}
  keyboardShortcuts={[keyboardShortcuts.instantEdit]}
/>;
```

With that shortcut enabled, typing on the active cell starts editing immediately. This is the behavior users expect from Excel and Google Sheets: click or navigate to a cell, type, and replace the value.

<Sandpack title="Instant edit from the keyboard" size="md" viewMode="preview">

<Description>

Click a cell and start typing. The first key press opens editing for the active cell.

</Description>

```tsx live file="$DOCS/reference/keyboard-shortcuts-instant-edit-example.page.tsx"

```

</Sandpack>

This removes a common source of friction in admin screens, pricing tools, scheduling grids, and internal finance apps where users edit many cells in sequence.

## Move focus from outside the grid

Sometimes the grid is not the only control in the workflow. A toolbar button, command palette, validation summary, or "next issue" control may need to move the active cell.

Use <PropLink name="onReady" /> to read `api.keyboardNavigationApi`, then call the [Keyboard Navigation API](/docs/reference/keyboard-navigation-api):

```tsx
const [keyboardNavigationApi, setKeyboardNavigationApi] =
  React.useState<InfiniteTableKeyboardNavigationApi<Developer>>();

<InfiniteTable
  defaultActiveCellIndex={[0, 0]}
  onReady={({ api }) => {
    setKeyboardNavigationApi(api.keyboardNavigationApi);
  }}
/>;

keyboardNavigationApi?.gotoCell({ direction: 'right' });
```

The API gives you methods such as:

- <KeyNavApiLink name="setKeyboardNavigation" /> - switch between cell, row, or disabled navigation
- <KeyNavApiLink name="setActiveCellIndex" /> - set a specific active cell
- <KeyNavApiLink name="setActiveRowIndex" /> - set a specific active row
- <KeyNavApiLink name="gotoNextRow" /> and <KeyNavApiLink name="gotoPreviousRow" /> - move vertically
- <KeyNavApiLink name="gotoCell" /> - move in a direction, like arrow-key navigation

<Sandpack title="Using the Keyboard Navigation API" size="md" viewMode="preview">

<Description>

Use the buttons above the grid to move the active cell through the keyboard navigation API.

</Description>

```tsx live file="$DOCS/reference/keyboard-navigation-api/goto-cell-example.page.tsx"

```

</Sandpack>

This is a good fit for "Jump to first invalid cell", "Review next changed value", or "Go to the current search match" experiences. You keep navigation behavior inside Infinite Table, while surrounding UI decides when to call it.

## Style the active cell for your app

Keyboard navigation needs a strong visual anchor. Infinite Table exposes CSS variables for the active cell highlight:

```css
.MyGrid {
  --infinite-active-cell-border-color--r: 120;
  --infinite-active-cell-border-color--g: 85;
  --infinite-active-cell-border-color--b: 255;
  --infinite-active-cell-background-alpha: 0.2;
}
```

Use the RGB variables when you want border and background to share the same color, or lower-level variables such as `--infinite-active-cell-background` and `--infinite-active-cell-border` when your design system needs different values.

The important part is contrast: keyboard users should always know where the next action will land.

## When to invest in keyboard workflows

Keyboard navigation is worth prioritizing when users repeat the same action across many rows or cells:

- reviewing transactions, claims, orders, tickets, or alerts
- editing prices, allocations, budgets, schedules, or forecasts
- navigating grouped analytics reports
- selecting many rows for bulk operations
- fixing validation errors across a large form-like grid

The docs give you a progressive path:

1. Start with the default active cell model.
2. Use <PropLink name="keyboardNavigation" /> and <PropLink name="keyboardSelection" /> for built-in movement and selection.
3. Add `keyboardShortcuts` for product-specific commands.
4. Enable `keyboardShortcuts.instantEdit` when editing should start on first key press.
5. Reach for `api.keyboardNavigationApi` when UI outside the grid needs to move focus.

That path keeps the implementation small: Infinite Table owns focus movement, virtualization-aware navigation, and selection behavior; your app owns the business action behind each shortcut.

## Go deeper in the docs

- [Keyboard navigation for cells](/docs/learn/keyboard-navigation/navigating-cells) - active cells, key map, row selection, grouped rows, and styling
- [Keyboard shortcuts](/docs/learn/keyboard-navigation/keyboard-shortcuts) - custom shortcut definitions, guards, handlers, and instant edit
- [Keyboard Navigation API](/docs/reference/keyboard-navigation-api) - imperative navigation from toolbars, command palettes, and external UI
