---
title: Keyboard Shorcuts
description: Infinite React DataGrid supports user-friendly keyboard shortcuts for executing custom actions.
---

The React DataGrid supports defining <PropLink name="keyboardShortcuts" code={false}>keyboard shorcuts</PropLink> for performing custom actions.

A keyboard shortcut is defined as an object of the following shape:
  
```ts
{
  key: string;
  when?: (context) => boolean | Promise<boolean>;
  handler: (context, event) => void | Promise<void>;
}
```

The `key` definition is what you're used to from VS Code and other applications - it can be
 * a single character: `t`, `x`, etc...
 * a combination of characters (e.g. `Ctrl+Shift+p`,`Cmd+Shift+Enter`) - key modifiers are supported, and can be added with the `+` (plus) sign.
 * or a special key (e.g. `Enter`, `ArrowUp`, `ArrowDown`, ` ` (space), `Escape`, `Delete`, `Insert`, `PageDown`,`PageUp`,`F1`, `F2`, etc).

 Examples of valid shortcuts: `Cmd+Shift+e`, `Alt+Shift+Enter`, `Shift+PageDown`, `Ctrl+x`


<Note>

There's a special key `*` that matches any key. This can be useful when you want to define a keyboard shortcut that should be triggered on any key press.

</Note>

<Sandpack>

<Description>
Click on a cell and use the keyboard to navigate.

Press `Shift+Enter` to show an alert with the current active cell position.

</Description>

```ts file="$DOCS/reference/keyboard-shortcuts-initial-example.page.tsx"
```
</Sandpack>

<Note>

Keyboard shortcuts have a `when` optional property. If defined, it restricts when the `handler` function is called. The handler will only be called when the handler returns `true`.

</Note>

## Implementing Keyboard Shortcut Handlers

Both the `handler` function and the `when` function of a keyboard shorcut are called with an object that gives access to the following:
 - `api` - a reference to the [Infinite Table API](/docs/reference/api) object.
 - `dataSourceApi` - a reference to the [DataSource API](/docs/reference/datasource-api) object.
 - `getState` - a function that returns the current state of the grid.
 - `getDataSourceState` - a function that returns the current state of the data source.

The second parameter of the `handler` function is the `event` object that triggered the keyboard shortcut.

## Predefined Keyboard Shortcuts

Infinite Table DataGrid comes with some predefined keyboard shorcuts.
you can import from the `keyboardShortcuts` named export.
```ts
import { keyboardShortcuts } from '@infinite-table/infinite-react'
```

### Instant Edit

```ts {4,12}
import {
  DataSource,
  InfiniteTable,
  keyboardShortcuts
} from '@infinite-table/infinite-react';

 function App() {
  return <DataSource<Developer> primaryKey="id" data={dataSource}>
    <InfiniteTable<Developer>
      columns={columns}
      keyboardShortcuts={[
        keyboardShortcuts.instantEdit
      ]}
    />
  </DataSource>
}
```


<Note>

For now, the only predefined keyboard shorcut is `keyboardShortcuts.instantEdit`. This keyboard shorcut starts cell editing when any key is pressed on the active cell. This is the same behavior found in Excel/Google Sheets.

</Note>

<Sandpack>

<Description>

Click on a cell and then start typing to edit the cell.

</Description>

```ts file="$DOCS/reference/keyboard-shortcuts-instant-edit-example.page.tsx"
```
</Sandpack>