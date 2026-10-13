---
title: Driving React DataGrid focus with the Keyboard Navigation API
description: Use Infinite Table's keyboardNavigationApi to move the active cell or row from toolbar buttons, command palettes, guided flows, and other custom UI.
date: 2026-10-13
author: radu
tags: keyboard-navigation, api, react-datagrid
---

Keyboard navigation is usually described from the user's point of view: click a cell, press the arrow keys, page through the grid, jump to the first or last row.

That is still the right default. Infinite Table enables cell navigation out of the box, and the [keyboard navigation docs](/docs/learn/keyboard-navigation/navigating-cells) cover the shortcuts users get for free.

But many product flows need to move focus from code as well:

- a toolbar button that jumps to the next invalid row
- a command-palette action that moves back to the grid
- onboarding UI that points users at a specific cell
- spreadsheet-like controls outside the grid that should still feel connected to it
- row navigation driven by buttons, shortcuts, or voice commands

That is what the [Keyboard Navigation API](/docs/reference/keyboard-navigation-api) is for.

## Keyboard mode first

Keyboard navigation is controlled by <PropLink name="keyboardNavigation" /> on `<InfiniteTable />`.

```tsx
<InfiniteTable keyboardNavigation="cell" />
```

The mode can be:

- `"cell"` - the default; the active position is `[rowIndex, columnIndex]`
- `"row"` - the active position is a row index
- `false` - keyboard navigation is disabled

For most grids, leave the default in place and reach for the API when outside UI needs to coordinate with the active cell.

## Get the API when the grid is ready

The keyboard navigation methods live on `api.keyboardNavigationApi`, available from <PropLink name="onReady" />.

```tsx
import {
  InfiniteTableApi,
  InfiniteTableKeyboardNavigationApi,
} from '@infinite-table/infinite-react';

const onReady = ({ api }: { api: InfiniteTableApi<Developer> }) => {
  api.keyboardNavigationApi.gotoCell({ direction: 'right' });
};

<InfiniteTable<Developer> columns={columns} onReady={onReady} />;
```

In a real app, you will usually store the API in a ref or state so buttons and command handlers can use it later.

```tsx
const keyboardNavigationApiRef =
  React.useRef<InfiniteTableKeyboardNavigationApi<Developer> | null>(null);

<InfiniteTable<Developer>
  columns={columns}
  defaultActiveCellIndex={[0, 0]}
  onReady={({ api }) => {
    keyboardNavigationApiRef.current = api.keyboardNavigationApi;
  }}
/>;

function goRight() {
  keyboardNavigationApiRef.current?.gotoCell({ direction: 'right' });
}
```

`gotoCell` accepts the same directional intent as arrow-key navigation: `top`, `bottom`, `left`, or `right`. It returns the new active cell index, or `false` when the move cannot happen.

That return value is useful for custom flows. For example, a "next field" button can try to move right, then decide what to do when it reaches the edge of the visible columns.

## A small directional control

The docs include a compact example that exposes four buttons around the grid. Each button calls `gotoCell` with a different direction.

<Sandpack title="Drive the active cell with buttons" size="md" viewMode="preview">

<Description>

The table starts with the first cell active. Use the buttons above the grid to move the active cell without pressing the keyboard arrow keys.

</Description>

```tsx live file="$DOCS/reference/keyboard-navigation-api/goto-cell-example.page.tsx"

```

</Sandpack>

The important part is not the buttons themselves. It is that grid navigation remains one system. A keyboard arrow press, a toolbar click, and a command-palette action can all update the same active cell state.

## Controlled and uncontrolled active positions

If you only need an initial position, use <PropLink name="defaultActiveCellIndex" /> for cell navigation or <PropLink name="defaultActiveRowIndex" /> for row navigation.

```tsx
<InfiniteTable
  keyboardNavigation="cell"
  defaultActiveCellIndex={[2, 0]}
/>
```

That keeps the active position uncontrolled by your React state, while still letting the keyboard API move it.

If the active position is part of your application state, use the controlled props:

```tsx
<InfiniteTable
  keyboardNavigation="cell"
  activeCellIndex={activeCellIndex}
  onActiveCellIndexChange={setActiveCellIndex}
/>
```

The docs call this out because it matters: when <PropLink name="activeCellIndex" /> or <PropLink name="activeRowIndex" /> is controlled, you must update it from <PropLink name="onActiveCellIndexChange" /> or <PropLink name="onActiveRowIndexChange" />. Otherwise the grid will ask to move, but your controlled value will keep rendering the old position.

## Row navigation works the same way

Switch <PropLink name="keyboardNavigation" /> to `"row"` when the grid interaction is row-oriented: master-detail screens, activity logs, issue lists, or inbox-like layouts.

The same API exposes row helpers:

```tsx
api.keyboardNavigationApi.gotoNextRow();
api.keyboardNavigationApi.gotoPreviousRow();
api.keyboardNavigationApi.setActiveRowIndex(10);
```

Those methods return the new row index or `false` when the action cannot be completed, which makes them easy to compose with buttons that should disable at the first or last row.

## When to use it

Use the Keyboard Navigation API when the grid should stay the focus model, but the trigger lives somewhere else.

Good examples:

- "Go to next error" after validating edited rows
- toolbar buttons for touch-heavy interfaces
- a command palette with "first row", "last row", "next column", or "previous row"
- guided walkthroughs that highlight a specific cell
- synchronized panels where a click outside the grid should move the active row

Avoid duplicating navigation state outside the grid unless you need full control. Start with <PropLink name="defaultActiveCellIndex" /> or <PropLink name="defaultActiveRowIndex" />, call the API from external controls, and only move to controlled props when another part of the app needs to own the active position.

## Go deeper in the docs

- [Keyboard Navigation API](/docs/reference/keyboard-navigation-api) - methods such as `gotoCell`, `gotoNextRow`, `gotoPreviousRow`, `setActiveCellIndex`, and `setActiveRowIndex`
- [Keyboard navigation for cells](/docs/learn/keyboard-navigation/navigating-cells) - default shortcuts, active cell state, selection, and theming
- [Keyboard navigation for rows](/docs/learn/keyboard-navigation/navigating-rows) - row mode, controlled row navigation, and active row styling
- [Keyboard shortcuts](/docs/learn/keyboard-navigation/keyboard-shortcuts) - the default shortcuts users can rely on
