---
title: Column Menus
description: Columns have menus that allow quick actions - the menus can be customized or hidden altogether.
---

All columns in the Infinite Table have a default menu, which can be customized or hidden altogether.

## Customise the menu items

To customize the column menu (for all columns, or for a specific column), use the <PropLink name="getColumContextMenuItems" /> prop. This function is called with an array of menu items (which are the default items) and it should the final array of menu items - so you can return the default items as is, or you can adjust the default items to fit your needs.

```tsx title=customizing-column-menu
function getColumnContextMenuItems(items, { column }) {

  if (column.id === 'firstName') {
    // you can adjust the default items for a specific column
    items.splice(0, 0, {
      key: 'firstName',
      label: 'First name menu item',
      onClick: () => {
        console.log('Hey there!');
      },
    });
  }

  // or for all columns
   items.push({
    key: 'hello',
    label: 'Hello World',
    onClick: () => {
      alert('Hello World from column ' + column.id);
    },
  });
  return items
}

```

<Note>

<PropLink name="getColumnContextMenuItems" /> can return an empty array, in which case, the column menu will not be shown - however, people will still be able to click the menu icon to trigger the column context menu.

If you want to dynamically decide whether a column should show a menu or not, you can use the <PropLink name="columns.renderMenuIcon" /> prop.

</Note>


<Sandpack title="Custom column menu items and custom menu icon">


<Description>

In this example, the currency and preferredLanguage columns have a custom icon for triggering the column context menu.

In addition, the `preferredLanguage` column has a custom header that shows a button for triggering the column context menu.

</Description>

```tsx file=$DOCS/reference/getColumnContextMenuItems-example.page.tsx

```

</Sandpack>


## Custom menu icon

To customize the menu icon, use the <PropLink name="columns.renderMenuIcon" /> prop. This prop can be a boolean or a function that returns a React element.

```tsx title=custom-menu-icon
const columns = {
  name: {
    field: 'firstName',
    renderMenuIcon: () => <div>🌎</div>,
  },
  salary: {
    field: 'salary',
    renderMenuIcon: false
  }
}
```