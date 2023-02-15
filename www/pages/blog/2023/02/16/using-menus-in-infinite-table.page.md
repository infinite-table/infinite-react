---
title: "Using Menus in Infinite Table"
description: "Find out how to use menus in Infinite Table to customise the DataGrid to fit your needs: custom context menus, column menus and more."
author: [admin]
---

*With version 1.1.0, our DataGrid now includes support for context menus, which are fully configurable so you can create custom menus for any cell in the table.*

<Note title="Context menus in Infinite Table">

1️⃣ are fully configurable

2️⃣ adjust their position based on the available space

3️⃣ can be used to create custom menus for any cell in the table

4️⃣ give you full access to the information in the cell or the whole DataGrid

</Note>

## How it works

In Infinite Table you can configure a context menu to be displayed when you right-click a cell by using the <PropLink name="getCellContextMenuItems" /> prop. Simply specify a function that returns an array of objects, each with `label` and `key` properties. Each object in the array is a row in the context menu - with the `label` being the displayed content and the `key` being a unique identifier for the menu row.

```tsx title=Configuring_a_context_menu
const getCellContextMenuItems = ({ column, data, value }) => {
  if (column.id === 'currency') {
    return [
      {
        label: `Convert ${value}`,
        key: 'currency-convert',
        onAction: (key, item) => {
          alert('clicked ' + item.key)
        }
      },
    ];
  }

  if (column.id === 'age') {
    return null;
  }

  return [
    {
      label: `Welcome ${value}`,
      key: 'hi',
    },
  ];
};

<DataSource<Developer> data={data} primaryKey="id">
  <InfiniteTable<Developer>
    getCellContextMenuItems={getCellContextMenuItems}
    columns={columns}
  />
</DataSource>

```

In the <PropLink name="getCellContextMenuItems" /> function prop, you have access to all the information you need, in the first argument of the function:

 - `column` - the column on which the user right-clicked
 - `data` - the data object for the row the user right-clicked
 - `value` - the value of the cell on which the context menu has been triggered. This is generally `data[column.field]`, but it can be different if the column has a <PropLink name="columns.valueGetter" /> or <PropLink name="columns.valueFormatter" />
 - `rowInfo` - an object that contains more information about the row, like the `id` (the primary key) and the row index
 - `isGroupRow`
 - and more


<Note>

If <PropLink name="getCellContextMenuItems" /> is specified and returns `null`, no custom context menu will be displayed, instead the default browser context menu will be shown (in this case, we do not call `preventDefault()` on the event object).

If <PropLink name="getCellContextMenuItems" /> returns an empty array, the default browser context menu will not be shown (in this case, we are calling `preventDefault()` on the event object), but also no custom context menu will be displayed, as there are no menu items to show.

</Note>


<Note title="Responding to user actions">

Each item on the context menu can specify an `onAction` function, which will be called when the user clicks on the menu item. The function will receive the `key` and the `item` as arguments.

In addition, since the menu items are returned from inside the `getCellContextMenuItems` function, the `onAction` callback has access to the same information as the `getCellContextMenuItems` function.
</Note>


<CSEmbed title="Context menu for all cells" id="cell-context-menus-ibtnn0" />

## Configuring the context menu to have multiple columns

In the above example, notice each context menu item has only one cell, where the `label` property is displayed.

However, Infinite Table for React allows you to create more complex menus, with multiple columns.

In order to do this, use the same <PropLink name="getCellContextMenuItems"/> prop, but return an object, with `columns` and `items`

```tsx

const getCellContextMenuItems = () => {
  return {
    columns: [
      { name: 'label' },
      { name: 'lcon' }
    ],
    items: [
      {
        label: 'Welcome',
        icon: '👋',
        key: 'hi',
      },
      {
        label: 'Convert',
        icon: '🔁',
        key: 'convert',
      }
    ]
  }
}
```

<Note>

When <PropLink name="getCellContextMenuItems"/> is used to configure the column menus, each column `name` should have a corresponding property in the objects returned in the `items` array (each object also needs to keep the `key` property).

Also, we recommend keeping a column named `label`.

</Note>

<CSEmbed id="custom-columns-for-context-menus-hcsz9e" title="Customising columns in the context menu
" />

## Smart positioning

Context menus in Infinite Table are smart enough to adjust their position based on the available space relative to the mouse-click coordinates. The menu will always try to fit inside the grid viewport and to look for the best position that will not cause the menu to be cut off or overflow outside the DataGrid.

The same algorithm is applied to column menus and also to filter menus (the menu displayed when a filter is shown and the user wants to change the filter operator).

## Context menus outside cells, for the table body

There are scenarios when you want to display a context menu even when you right-click outside a cell, but inside the table body - for those cases, you can use <PropLink name="getContextMenuItems" /> (in fact, you can use the <PropLink name="getContextMenuItems" /> prop for all context menus).

The signature of <PropLink name="getContextMenuItems" /> is almost identical with that of <PropLink name="getCellContextMenuItems"/>, with the exception that cell-related information can be undefined - if the user didn't right-click a cell, but somewhere else in the table body.


<CSEmbed id="table-context-menus-0h2qzf" title="Context menus outside cells, for the table body"/>

In the example above, if you click outside a cell, a menu with a single item will be displayed - `Add Item`. If you click on a cell, the menu will be different, and will show information about the clicked cell.


## Column menus

Besides context menus, the DataGrid also supports menus for columns, that allow you to sort/unsort, pin/unpin, clear filtering and toggle column visibility.

Just like context menus, the column menus can also be fully customised, by using the <PropLink name="getColumnMenuItems" /> prop.

```tsx title=Customizing-column-menu
function getColumnMenuItems(items, { column }) {

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

The first argument passed to the <PropLink name="getColumnMenuItems" /> prop is the array of items that is displayed by default in the column menu.

You can either modify this array and return it or you can return another totally different array.

</Note>


<CSEmbed id="custom-column-menus-93jsyb" />

As with context menus, positioning column menus is also smart - the menu will always try to fit inside the grid viewport, so it will align to the right or the left of the column, depending on the available space.

## Conclusion

In this article, we've explained just some of the scenarios that are now possible with Infinite Table for React, by using the new context and column menus.


<HeroCards>
<YouWillLearnCard title="Working with Context Menus" path="/docs/learn/context-menus/using-context-menus">
Learn more about working with context menus.
</YouWillLearnCard>
<YouWillLearnCard title="Using Column Menus" path="/docs/learn/columns/column-menus">
Configuring column menus to fit your needs - read more.
</YouWillLearnCard>
</HeroCards>

We hope you'll use these functionalities to build amazing DataGrids for your applications, that are fully tailored to your needs.

If you find any issues or have any questions, please reach out to us on [Twitter](https://twitter.com/infinite_table) or in the [GitHub Discussions](https://github.com/infinite-table/infinite-react/discussions) or [issues](https://github.com/infinite-table/infinite-react/issues).

We're happy to help and improve how you work with the component - we want to make it very easy and straight-forward to use it and are looking for ways to simplify our APIs to **achieve more with less**.

