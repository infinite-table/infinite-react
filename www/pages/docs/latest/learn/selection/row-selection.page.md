---
title: Row Selection
description: InfiniteTable DataGrid component supports single and multiple row selection, including checkbox column selection and lazy rows selection
---

`InfiniteTable` offers support for both single and multiple row selection. Multiple row selection allows people to select rows just like they would in their MacOS Finder app, by clicking desired rows and using the cmd/shift keys as modifiers.

The DataGrid also offers support for **checkbox selection**, which is another easy way of interacting with grid rows, especially when grouped/nested data is used.

Row selection (both single and multiple) is driven by the <DPropLink name="rowSelection" /> prop

<Note>

Row selection is defined on the `DataSource` component, so that's where you specify your <DPropLink name="rowSelection" /> prop (or the uncontrolled version of it, namely <DPropLink name="defaultRowSelection" /> and also the callback prop of <DPropLink name="onRowSelectionChange" />).

</Note>

<Note>

You can explicitly specify the <DPropLink name="selectionMode" /> as `"single-row"` or `"multi-row"` (or `false`) but it will generally be deduced from the value of your <DPropLink name="rowSelection" />/<PropLink name="defaultRowSelection" /> prop.

</Note>

# Single Row Selection

This is the most basic row selection - in this case the <DPropLink name="rowSelection" /> prop (or the uncontrolled variant <DPropLink name="defaultRowSelection" />) will be a string or a number (or `null` for no selection).


```ts {4}
<DataSource<DATA_TYPE>
  primaryKey="id"
  data={[...]}
  defaultRowSelection={4}
>
  <InfiniteTable {...} />
</DataTable>

```
<Sandpack title="Uncontrolled single row selection">

<Description>

Single row selection example - click a row to see selection change. You can also use your keyboard - press the spacebar to select/deselect a row.

</Description>

```ts file=../../reference/default-single-row-selection-example.page.tsx
```

</Sandpack>

Row selection is changed when the user clicks a row. Clicking a row selects it and clicking it again keeps the row selected. For deselecting the row with the mouse use `cmd`/`ctrl` + click.

## Keybord support

You can also use your keyboard to select a row, as by default, <PropLink name="keyboardSelection" /> is `true`. Using your keyboard, navigate to the desired row and then press the spacebar to select it. Pressing the spacebar again on the selected row will deselect it.

<Note>

Both `cell` and `row` <PropLink name="keyboardNavigation" /> are available and you can use either of them to perform row selection.

</Note>

## Controlled single row selection

Row selection can be used as a <DPropLink name="rowSelection" code={false}>controlled</DPropLink> or <PropLink name="defaultRowSelection" code={false}>uncontrolled</PropLink> property. For the controlled version, make sure you also define your <DPropLink name="onRowSelectionChange" /> callback prop to update the selection.

<Sandpack title="Controlled single row selection">

<Description>

This example uses <DPropLink name="onRowSelectionChange" /> callback prop to update the controlled <DPropLink name="rowSelection" />

</Description>


```ts file=../../reference/controlled-single-row-selection-example.page.tsx
```

</Sandpack>


# Multi Row Selection

You can configure multiple selection for rows so users can interact with it through clicking around or via a checkbox selection column.

## Using your mouse and keyboard to select rows

If you're using checkboxes for selection, users will be selecting rows via click or click + `cmd`/`ctrl` and `shift` keys, just like they are used to in their native Finder/Explorer applications. 

### Mouse interactions

For selecting with the mouse, the following gestures are supported (we tried to exactly replicate the logic/behaviour from MacOS Finder app, so most people should find it really intuitive):

 * clicking a row (with no modifier keys) will select that row, while clearing any existing selection
 * click + `cmd`/`ctrl` modifier key will toggle the selection for the clicked row while keeping any other existing selection. So if the row was not selected, it's being added to the current selection, while if the row was already selected, it's being removed from the selection
 * click + `shift` modifier key will perform a multi selection, starting from the last selection click where the `shift` key was not used.

<Sandpack title="Multi row selection">

<Description>

Use your mouse to select multiple rows. Expect click and click + `cmd`/`ctrl`/`shift` modifier keys to behave just like they are in the MacOS Finder app.

</Description>


```ts file=../../reference/default-selection-mode-multi-row-example.page.tsx
```

</Sandpack>


### Keyboard interactions

By default <PropLink name="keyboardSelection" /> is enabled, so you can use the **spacebar** key to select multiple rows.  Using the spacebar key is equivalent to doing a mouse click, so expect the combination of **spacebar** + `cmd`/`ctrl`/`shift` modifier keys to behave just like clicking + the same modifier keys.

<Sandpack title="Multi row selection with keyboard support">

<Description>

Use spacebar + optional `cmd`/`ctrl`/`shift` modifier keys just like you would do clicking + the same modifier keys.

</Description>


```ts file=../../reference/default-selection-mode-multi-row-keyboard-toggle-example.page.tsx
```

</Sandpack>

<Note>

For selection all the rows in the table, you can use `cmd`/`ctrl` + `A` keyboard shortcut.

</Note>


## Using a selection checkbox

Selection multiple rows is made easier when there is a checkbox column and even-more-so when there is grouping. 

Configuring checkbox selection is as easy as specifying <PropLink name="columns.renderSelectionCheckBox">renderSelectionCheckBox</PropLink> on any of the columns in the grid. <PropLink name="columns.renderSelectionCheckBox">renderSelectionCheckBox</PropLink> can either be the boolean `true` or a render function that allows the customization of the selection checkbox.

```ts {8}
const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    defaultWidth: 80,
  },
  country: {
    // show the selection checkbox for this column
    renderSelectionCheckBox: true,
    field: 'country',
  },
  firstName: {
    field: 'firstName',
  },
}
```

<Note>

Any column can show a selection checkbox if <PropLink name="columns.renderSelectionCheckBox">renderSelectionCheckBox</PropLink> is set to `true`.

Nothing stops you from having even multiple checkbox columns.

</Note>

<Sandpack title="Multi row selection with checkbox support">

<Description>

Use the selection checkboxes to select rows. You can also use the spacebar key (+ optional shift modifier) to modify the selection

</Description>


```ts file=../../reference/default-checkbox-selection-multi-row-example.page.tsx
```

</Sandpack>

### Mouse interactions

The mouse interactions are the obvious ones you would expect from checkbox selection. Clicking a checkbox will toggle the selection for the correspondign row. Also, clicking the header checkbox will select/deselect all the rows in the table. The selection checkbox in the column header can be in an indeterminate state (when just some of the rows are selected), and when clicking it, it will become checked and select all rows.

<Gotcha>

You can use <PropLink name="columns.renderHeaderSelectionCheckBox">renderHeaderSelectionCheckBox</PropLink> for a column to customize the checkbox in the column header. If no header selection checkbox is specified, <PropLink name="columns.renderSelectionCheckBox">renderSelectionCheckBox</PropLink> will be used for the column header as well, just like it's used for grid rows.

</Gotcha>


### Keyboard interactions

When multi-row selection is configured to use checkboxes, you can still use your keyboard to select rows. Navigate to the desired row (you can have <PropLink name="keyboardNavigation">keyboard navigation</PropLink> active for either cells or rows) and press the spacebar. If the row is not selected it will select it, otherwise it will deselect it.

<Note>

The only supported modifier key when selecting a row by pressing **spacebar** is the `shift` key - it allows users to extend the selection over multiple rows, which is handy.

</Note>

## Specify a `rowSelection` value

When multiple row selection is used, the <PropLink name="rowSelection" /> prop should be an object that can have the following shape:


```ts
const rowSelection = {
  selectedRows: [3, 6, 100, 23], // those specific rows are selected
  defaultSelection: false // while all other rows are deselected by default
}

// or 
const rowSelection = {
  deselectedRows: [3, 6, 100, 23], // those specific rows are deselected
  defaultSelection: true // all other rows are selected
}

// or, for grouped data - this example assumes groupBy=continent,country,city
const rowSelection = {
  selectedRows: [
    45, // row with id 45 is selected, no matter the group it is nested in
    ['Europe','France'], // all rows in Europe/France are selected
    ['Asia'] // all rows in Asia are selected
  ]
  deselectedRows: [
    ['Europe','France','Paris'] // all rows in Paris are deselected
  ],
  defaultSelection: false // all other rows are selected
}
```

For non-grouped data, the first two forms of the `rowSelection` prop are enough, but for nested grouped data, we need the third form as well.

In this case, selection can have various nested values, so we had to come up with a simple way allow you to express the selection state.

The `rowSelection.selectedRows` and `rowSelection.deselectedRows` arrays can either contain:

 * ids of rows (which are usually strings or numbers) - any non-array element inside `rowSelection.selectedRows`/`rowSelection.deselectedRows` is considered an id/primaryKey value for a leaf row in the grouped dataset.
 * arrays of group keys - those arrays describe the path of the specified selected group. Please note that `rowSelection.selectedRows` can contain certain paths while `rowSelection.deselectedRows` can contain child paths of those paths ... or any other imaginable combination.

<Note>

When <DPropLink name="lazyLoad" /> is being used - this means not all available groups/rows have actually been loaded yet in the dataset - we need a way to allow you to specify that those possibly unloaded rows/groups are selected or not. In this case, the `rowSelection.selectedRows`/`rowSelection.deselectedRows` arrays should not have ids as strings/numbers, but rather specified by the full path.

```ts {6}
// this example assumes groupBy=continent,country,city
const rowSelection = {
  selectedRows: [
    // row with id 45 is selected - we need this because in the lazyLoad scenario,
    // not all parents might have been made available yet
    ['Europe','Italy', 'Rome', 45],
    ['Europe','France'], // all rows in Europe/France are selected
    ['Asia'] // all rows in Asia are selected
  ]
  deselectedRows: [
    ['Europe','Italy','Rome'] // all rows in Rome are deselected
    // but note that row with id 45 is selected, so Rome will be rendered with an indeterminate selection state
  ],
  defaultSelection: false // all other rows are selected
}
```

In the example above, we know that there are 3 groups (`continent`, `country`, `city`), so any item in those array that has a 4th element is a fully specified leaf node. While lazy loading, we need this fully specified path for specific nodes, so we know which group rows to render with indeterminate selection
</Note>


### Controlled selection with checkbox column

When using the controlled <DPropLink name="rowSelection" />, make sure to specify the <DPropLink name="onRowSelectionChange" /> callback prop to update the selection accordinly as a result of user interaction.

<Sandpack title="Multi row checkbox selection with grouping" >

<Description>

This example shows how you can use multiple row selection with a predefined controlled value.

Go ahead and select some groups/rows and see the selection value adjust.

The example also shows how you can use the `InfiniteTableApi` to retrieve the actual ids of the selected rows.

</Description>


```ts file=../../reference/controlled-multi-row-selection-example.page.tsx
```

</Sandpack>

## Multi Selection with Lazy Load and Grouping

Probably the most complex use-case for multi selection (with checkbox) is the combination of grouping and lazy-loading.

In this scenario, not all groups and/or rows are loaded at a given point in time, but we need to be able to know how to render each checkbox for each group - either checked, unchecked or indeterminate, all this depending on whether all children, at any nesting levels are selected or not.

In order to make this possible, the <DPropLink name="rowSelection" /> value will only contain arrays (and not individual primary keys) in the `selectedRows` and `deselectedRows` arrays.