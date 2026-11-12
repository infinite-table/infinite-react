---
title: Using Context Menus
description: InfiniteTable DataGrid allows you to easily configure context menus for any row and cell in the table and for the whole table body.
---

The easiest way to configure a context menu is to provide the <PropLink name="getCellContextMenuItems" /> callback function and use it to return the menu items you want to show in the context menu.

```tsx file="using-context-menus.snippet.tsx" region="intro"
```

<DemoTitle>Using context menus</DemoTitle>
<DemoDescription>

Right-click any cell in the table to see the custom context menu.

</DemoDescription>

```tsx file="basic-cells-context-menu-example.demo.tsx"
```

<Note>

The <PropLink name="getCellContextMenuItems" /> function can return one of the following:

- `null` - no custom context menu will be displayed, the default context menu will be shown (default event behavior not prevented)
- `[]` - an empty array - no custom context menu will be displayed, but the default context menu is not shown - the default event behavior is prevented
- `Array<MenuItem>` - an array of menu items to be displayed in the context menu - each `MenuItem` should have:
  - a unique `key` property,
  - a `label` property with the value to display in the menu cell - it's called `label` because this is the name of the default column in the context menu
  - an optional `onClick` callback function to handle the click event on the menu item.

In addition, if you need to configure the context menu to have other columns rather than the default column (named `label`), you can do so by returning an object with `columns` and `items`:

```tsx file="using-context-menus.snippet.tsx" region="intro-2"
```

<DemoTitle>Customising columns in the context menu</DemoTitle>
<DemoDescription>

Right-click any cell in the table to see a context menu with multiple columns (`icon`, `label` and `description`).

</DemoDescription>

```tsx file="custom-columns-context-menu-example.demo.tsx"
```
</Note>

## Context Menus for the Table Body

You might want to show a context menu for the table body, when the user right-clicks outside of any existing cell.

For this, you can use the <PropLink name="getContextMenuItems" /> prop.

This function has almost the same signature as <PropLink name="getCellContextMenuItems" />, with the following differences in the object passed as first parameter:

- all cell-related properties (`column`, `data`, `value`, etc) can be `undefined`
- it contains an `event` property with the original event object for the right-click event

<DemoTitle>Context menu for outside cells</DemoTitle>
<DemoDescription>

Right-click outside cells in the table to see a context menu for the table body.

</DemoDescription>

```tsx file="table-context-menu-example.demo.tsx"
```

## Hiding the Context Menu

To hide the context menu when you click a menu item, you can use the `hideMenuOnAction` property on the menu item.

Alternatively, you can use the object passed in as a parameter to the `item.onAction` callback function to hide the menu:

```tsx file="using-context-menus.snippet.tsx" region="hiding-the-context-menu"
```

The third option is to use the <ApiLink name="hideContextMenu" /> function in the [API](/docs/reference/api).
