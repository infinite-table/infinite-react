---
title: Inline Editing
draft: true
---

By default, inline editing is not enabled.


You can enable it globally by using the boolean property <PropLink name="columnDefaultEditable" >columnDefaultEditable=true</PropLink> on the `InfiniteTable` component. This makes all columns editable.

Or you can be more specific and choose to make individual columns as editable via the <PropLink name="columns.defaultEditable">column.defaultEditable</PropLink> prop (this overrides the global <PropLink name="columnDefaultEditable" />).

<Note>

The <PropLink name="columns.defaultEditable">column.defaultEditable</PropLink> property can be either a `boolean` or a `function`.

If it is a function, it will be called when an edit is triggered on the column. The function will be called with a single object that contains the following properties:

 * `value` - the current value of the cell
 * `data` - the data object (of type `DATA_TYPE`) for the current row
 * `rowInfo` - the row info object that underlies the row
 * `column` - the current column on which editing is invoked

The function can return a boolean value or a Promise that resolves to a boolean value - this means you can decide asynchronously whether the cell is editable or not.

Making <PropLink name="columns.defaultEditable">column.defaultEditable</PropLink> a function gives you the ability to granularly control which cells are editable or not (even within the same column, based on the cell value or other values you have access to).

</Note>

In addition to the flags mentioned above, you can use the <PropLink name="editable" /> prop on the `InfiniteTable` component. This overrides all other properties and when it is defined, is the only source of truth for whether something is editable or not.

<Note>

The <PropLink name="editable" /> prop allows you to centralize editing logic in one place.

It has the same signature as the <PropLink name="columns.defaultEditable">column.defaultEditable</PropLink> function.

</Note>
