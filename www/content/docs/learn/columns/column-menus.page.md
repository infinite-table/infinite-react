---
title: Column Menus
description: Columns have menus that allow quick actions - the menus can be customized or hidden altogether.
---

All columns in the Infinite Table have a default menu, which can be customized or hidden altogether.

## Customise the menu items

To customize the column menu (for all columns, or for a specific column), use the <PropLink name="getColumnMenuItems" /> prop. This function is called with an array of menu items (which are the default items) and it should the final array of menu items - so you can return the default items as is, or you can adjust the default items to fit your needs.

```tsx file="column-menus.snippet.tsx" region="customizing-column-menu" title="Customizing-column-menu"
```

<Note>

<PropLink name="getColumnMenuItems" /> can return an empty array, in which case, the column menu will not be shown - however, people will still be able to click the menu icon to trigger the column context menu.

If you want to dynamically decide whether a column should show a menu or not, you can use the <PropLink name="columns.renderMenuIcon" /> prop.

</Note>

<DemoTitle>Custom column menu items and custom menu icon</DemoTitle>
<DemoDescription>

In this example, the currency and preferredLanguage columns have a custom icon for triggering the column context menu.

In addition, the `preferredLanguage` column has a custom header that shows a button for triggering the column context menu.

</DemoDescription>

```tsx file="/docs/reference/getColumnMenuItems-example.demo.tsx"
```

As you can see in the demo above, you can use <PropLink name="getColumnMenuItems" /> to return the default items (received as the first parameter to the function), or another totally different array. We chose to pass the default items to the function, so you can use them as a starting point and adjust them to your needs.

Each item in the array you return from <PropLink name="getColumnMenuItems" /> should have a `key` and a `label` property. Additionally, you can specify an `onAction` function, which will be called when the user clicks the menu item.

It's also possible to create items with submenus. For this, specify a `menu` property in the item, with an `items` array. Each item in the `items` array should have a `key` and a `label` property, as you would expect.

```tsx file="column-menus.snippet.tsx" region="menu-items-with-submenus" title="Menu_items_with_submenus"
```

## Custom menu icon

To customize the menu icon, use the <PropLink name="columns.renderMenuIcon" /> prop. This prop can be a boolean or a function that returns a `ReactNode`.

```tsx file="column-menus.snippet.tsx" region="custom-menu-icon" title="custom-menu-icon"
```

<Note>

For a custom menu icon 🌠 you don't have to hook up the `mousedown`/`click` in order to show or hide the menu - all this is done for you - just render your custom `ReactNode` and you're good to go.

</Note>
