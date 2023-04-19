---
title: Column Order
description: Change column order by drag-and-drop - drag columns around and reorder them live
---

React `Infinite Table` allows columns to be reordered in the grid by drag-and-drop. Drag columns around (start dragging the colum header) to change their order and arrange them in the desired position.

<Note>

Column ordering via drag & drop works by default.

</Note>

You don't have to specify an initial column order or any other callback props to update the column order. The default behavior of the component is to initially display all columns that are provided in the <PropLink name="columns" /> object (in the iteration order of the object keys).

If using the <PropLink name="defaultColumnOrder" code={false}>default uncontrolled column order</PropLink> is not enough, try using the controlled <PropLink name="columnOrder" /> prop, which gives you full control over the order of the columns - in this case, you have to update the column order as a result of user interaction, by specyfing <PropLink name="onColumnOrderChange" />.

<Sandpack title="Column reordering via drag & drop with controlled `columnOrder`">

```tsx file="$DOCS/reference/columnOrder-example.page.tsx"

```

</Sandpack>

<Note>

Column order can also be used in order to limit/modify the visible columns. Specify a limited number of columns in the <PropLink name="columnOrder" /> array and only those columns will be displayed.

For more advanced control on visibility, see <PropLink name="columnVisibility" />.

</Note>

The <PropLink name="columnOrder" /> array can contain any number of columns, even duplicate columns or random strings - the behavior is that any column ids which are not found in the <PropLink name="columns" /> object are ignored, while columns mentioned multiple times will be included multiple times, as indicated in the column order. Displaying the same column twice is a perfectly valid use case.

<Sandpack title="Advanced column order example">

<Description>
In this example, <PropLink name="columnOrder" /> is used as a controlled property, also as a way of limiting the visible columns.
</Description>

```tsx file="$DOCS/reference/columnOrder-advanced-example.page.tsx"

```

</Sandpack>

<Note>

The <PropLink name="columnOrder" /> prop can either be an array of strings (column ids) or the boolean `true`. When `true`, all columns present in the <PropLink name="columns" /> object will be displayed, in the iteration order of the object keys - in the example above, try clicking the `"Click to reset column order"` button.

</Note>

For all of the above examples, <PropLink name="columnVisibility" /> will also be taken into account, as it is the last source of truth for the visibility of a column.

Using <PropLink name="columnOrder" /> in combination with <PropLink name="columnVisibility" /> is very powerful - for example, you can have a specific column order even for columns which are not visible at a certain moment, so when they will be made visible, you'll know exactly where they will be displayed.
