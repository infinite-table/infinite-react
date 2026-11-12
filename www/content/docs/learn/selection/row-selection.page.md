---
title: Row Selection
description: InfiniteTable DataGrid component supports single and multiple row selection, including checkbox column selection and lazy rows selection
---

`InfiniteTable` offers support for both single and multiple row selection. For selecting cells, see the [Cell Selection](/docs/learn/selection/cell-selection) page.

```tsx file="row-selection.snippet.tsx" region="configure-the-selection-mode-on-the-datasource" title="Configure the selection mode on the DataSource component"
```

Multiple row selection allows people to select rows just like they would in their MacOS Finder app, by clicking desired rows and using the cmd/shift keys as modifiers.

The DataGrid also offers support for **checkbox selection**, which is another easy way of interacting with grid rows, especially when grouped or nested data is used.

Row selection (both single and multiple) is driven by the <DPropLink name="rowSelection" /> prop, which will contain **primary keys of the selected rows**.

<Note>

The value or values you specify for row selection are primary keys of the rows in the DataGrid.

Row selection is defined on the `DataSource` component, so that's where you specify your <DPropLink name="rowSelection" /> prop (or the uncontrolled version of it, namely <DPropLink name="defaultRowSelection" /> and also the callback prop of <DPropLink name="onRowSelectionChange" />).

</Note>

<Note>

You can explicitly specify the <DPropLink name="selectionMode" /> as `"single-row"` or `"multi-row"` (or `false`) but it will generally be derived from the value of your <DPropLink name="rowSelection" />/<PropLink name="defaultRowSelection" /> prop.

</Note>

# Single Row Selection

This is the most basic row selection - in this case the <DPropLink name="rowSelection" /> prop (or the uncontrolled variant <DPropLink name="defaultRowSelection" />) will be the primary key of the selected row (a string or a number or `null` for no selection).

```ts file="row-selection.snippet.tsx" region="single-row-selection"
```

<DemoTitle>Uncontrolled single row selection</DemoTitle>
<DemoDescription>

Single row selection example - click a row to see selection change. You can also use your keyboard - press the spacebar to select/deselect a row.

</DemoDescription>

```tsx file="/docs/reference/default-single-row-selection-example.demo.tsx"
```

Row selection is changed when the user clicks a row. Clicking a row selects it and clicking it again keeps the row selected. For deselecting the row with the mouse use `cmd`/`ctrl` + click.

With single row selection and grouped data, clicking a group row doesn't change the selection - only normal rows can be selected.

## Keybord support

You can also use your keyboard to select a row, as by default, <PropLink name="keyboardSelection" /> is `true`. Using your keyboard, navigate to the desired row and then press the spacebar to select it. Pressing the spacebar again on the selected row will deselect it. Pressing the spacebar on a group row doesn't change the selection.

<Note>

Both `cell` and `row` <PropLink name="keyboardNavigation" /> are available and you can use either of them to perform row selection.

</Note>

## Controlled single row selection

Row selection can be used as a <DPropLink name="rowSelection" code={false}>controlled</DPropLink> or <PropLink name="defaultRowSelection" code={false}>uncontrolled</PropLink> property. For the controlled version, make sure you also define your <DPropLink name="onRowSelectionChange" /> callback prop to update the selection.

<DemoTitle>Controlled single row selection</DemoTitle>
<DemoDescription>

This example uses <DPropLink name="onRowSelectionChange" /> callback prop to update the controlled <DPropLink name="rowSelection" />

</DemoDescription>

```tsx file="/docs/reference/controlled-single-row-selection-example.demo.tsx"
```

# Multi Row Selection

You can configure multiple selection for rows so users can interact with it through clicking around or via a checkbox selection column.

## Choosing how users select rows

The <PropLink name="multiRowSelectionWith" /> prop decides whether clicking a row selects it:

- `'checkbox'` (the default) - while a visible column shows a selection checkbox (see <PropLink name="columns.renderSelectionCheckBox">renderSelectionCheckBox</PropLink>), users select rows with the checkboxes and the spacebar. Clicking a row only makes it the active row (or cell) - it doesn't change the selection. When no visible column shows a selection checkbox, it works like `'click'`.
- `'click'` - clicking a row selects it, with `cmd`/`ctrl` and `shift` as modifier keys. The selection checkboxes, if any, work as well.

```tsx file="row-selection.snippet.tsx" region="choosing-how-users-select-rows"
```

Both values work the same with or without grouping, and with [tree data](/docs/learn/tree-grid/tree-selection#selecting-nodes-with-the-mouse-and-keyboard). In both cases, users can also select rows with the keyboard, and all the gestures (clicks, checkbox clicks and the spacebar) share the same starting point for `shift` ranges.

## Using your mouse and keyboard to select rows

When there is no selection checkbox (or with <PropLink name="multiRowSelectionWith">multiRowSelectionWith="click"</PropLink>), users select rows via click or click + `cmd`/`ctrl` and `shift` keys, just like they are used to in their native Finder/Explorer applications.

### Mouse interactions

For selecting with the mouse, the following gestures are supported (we tried to exactly replicate the logic/behaviour from MacOS Finder app, so most people should find it really intuitive):

- clicking a row (with no modifier keys) will select that row, while clearing any existing selection
- click + `cmd`/`ctrl` modifier key will toggle the selection for the clicked row while keeping any other existing selection. So if the row was not selected, it's being added to the current selection, while if the row was already selected, it's being removed from the selection
- click + `shift` modifier key will perform a multi selection, starting from the last selection click where the `shift` key was not used.

When the data is grouped, a group row is selected as a whole: clicking it selects all the rows in the group (and in its nested groups), and `cmd`/`ctrl` + click toggles the whole group. Clicking the expand/collapse icon of a group row doesn't change the selection.

<DemoTitle>Multi row selection</DemoTitle>
<DemoDescription>

Use your mouse to select multiple rows. Expect click and click + `cmd`/`ctrl`/`shift` modifier keys to behave just like they are in the MacOS Finder app.

</DemoDescription>

```tsx file="/docs/reference/default-selection-mode-multi-row-example.demo.tsx"
```

### Selecting a range of rows with groups

When the data is grouped, a `shift` range covers the rows as they are displayed, from the starting row to the clicked row, in either direction:

- normal rows are selected;
- a collapsed group row selects its whole group, including its nested groups;
- an expanded group row follows its children - only its rows inside the range are selected, so the group shows as selected when all its rows are in the range, and as partly selected when only some of them are. This is also the case when you `shift` + click an expanded group row: its rows are below it, so going down to it doesn't select any of them;
- the starting row keeps what its own click selected - when it's a group row, its whole group stays selected;
- a new `shift` + click from the same starting row replaces the range selected by the previous one (rows outside the range keep their selection), just like in the Finder app.

So a wider range never selects fewer rows.

For example, with the rows grouped by language and the `Go` group collapsed:

```
TypeScript
   TS 1
   TS 2    <- click
   TS 3
Go         (collapsed - Go 1, Go 2)
Rust
   Rust 1
   Rust 2  <- shift + click
   Rust 3
```

clicking `TS 2` and then `shift` + clicking `Rust 2` selects `TS 2`, `TS 3`, all of `Go` (`Go 1` and `Go 2`), `Rust 1` and `Rust 2`, but not `Rust 3`. `TypeScript` and `Rust` are partly selected, while `Go` is selected.

A partly selected group or tree row is painted with a lighter selection background, halfway between the row background and the selected row background. A selection checkbox on that row shows the indeterminate state. The same applies when some rows of the group are hidden by a filter and `multiRowSelectionTarget` is `'all'`.

If you then `shift` + click the `Rust` group row instead, the range ends just above the rows of `Rust`, so it selects `TS 2`, `TS 3` and all of `Go`, while `Rust` is not selected. And clicking the `Rust` group row first, then `shift` + clicking `TS 3`, selects `TS 3`, all of `Go` and all of `Rust` - the starting group stays selected as a whole.

The same rules apply to `shift` + spacebar and to `shift` + clicking a selection checkbox.

<DemoTitle>Selecting a range of rows with groups</DemoTitle>
<DemoDescription>

Click `TS 2`, then `shift` + click `Rust 2` - `Go` is collapsed, so all its rows are selected. Then `shift` + click the `Rust` group row - the range now ends above the rows of `Rust`.

Switch <PropLink name="multiRowSelectionWith" /> to `'checkbox'` to select with the checkboxes in the group column instead.

</DemoDescription>

```tsx file="row-selection-ranges-with-groups-example.demo.tsx"
```

### Keyboard interactions

By default <PropLink name="keyboardSelection" /> is enabled, so you can use the **spacebar** key to select multiple rows. Using the spacebar key is equivalent to doing a mouse click, so expect the combination of **spacebar** + `cmd`/`ctrl`/`shift` modifier keys to behave just like clicking + the same modifier keys. This also works for group rows.

<DemoTitle>Multi row selection with keyboard support</DemoTitle>
<DemoDescription>

Use spacebar + optional `cmd`/`ctrl`/`shift` modifier keys just like you would do clicking + the same modifier keys.

</DemoDescription>

```tsx file="/docs/reference/default-selection-mode-multi-row-keyboard-toggle-example.demo.tsx"
```

<Note>

For selecting all the rows in the table, you can use `cmd`/`ctrl` + `A` keyboard shortcut.

</Note>

## Using a selection checkbox

Selection multiple rows is made easier when there is a checkbox column and even-more-so when there is grouping.

With the default <PropLink name="multiRowSelectionWith" /> (`'checkbox'`), once a visible column shows a selection checkbox, clicking a row no longer selects it - users select rows with the checkboxes and the spacebar. Use <PropLink name="multiRowSelectionWith">multiRowSelectionWith="click"</PropLink> to keep selecting rows by clicking them as well.

Configuring checkbox selection is as easy as specifying <PropLink name="columns.renderSelectionCheckBox">renderSelectionCheckBox</PropLink> on any of the columns in the grid. <PropLink name="columns.renderSelectionCheckBox">renderSelectionCheckBox</PropLink> can either be the boolean `true` or a render function that allows the customization of the selection checkbox.

```ts file="row-selection.snippet.tsx" region="using-a-selection-checkbox"
```

<Note>

Any column can show a selection checkbox if <PropLink name="columns.renderSelectionCheckBox">column.renderSelectionCheckBox</PropLink> is set to `true`.

There is nothing prevening you from providing multiple checkbox columns.

</Note>

<DemoTitle>Multi row selection with checkbox support</DemoTitle>
<DemoDescription>

Use the selection checkboxes to select rows. You can also use the spacebar key (+ optional shift modifier) to modify the selection

</DemoDescription>

```tsx file="/docs/reference/default-checkbox-selection-multi-row-example.demo.tsx"
```

### Mouse interactions

The mouse interactions are the obvious ones you would expect from checkbox selection. Clicking a checkbox will toggle the selection for the correspondign row (or for the whole group, on a group row). Also, clicking the header checkbox will select/deselect all the rows in the table. The selection checkbox in the column header can be in an indeterminate state (when just some of the rows are selected), and when clicking it, it will become checked and select all rows.

`shift` + clicking a checkbox selects the range of rows from the last checkbox clicked (or the last row selected with the spacebar) to the clicked row - see [selecting a range of rows with groups](#selecting-a-range-of-rows-with-groups) for how group rows are handled.

<Note>

You can use <PropLink name="columns.renderHeaderSelectionCheckBox">renderHeaderSelectionCheckBox</PropLink> for a column to customize the checkbox in the column header. If no header selection checkbox is specified, <PropLink name="columns.renderSelectionCheckBox">renderSelectionCheckBox</PropLink> will be used for the column header as well, just like it's used for grid rows.

</Note>

### Keyboard interactions

When multi-row selection is configured to use checkboxes, you can still use your keyboard to select rows. Navigate to the desired row (you can have <PropLink name="keyboardNavigation">keyboard navigation</PropLink> active for either cells or rows) and press the spacebar. If the row (or group) is not selected it will select it, otherwise it will deselect it - just like clicking its checkbox.

<Note>

The only supported modifier key when selecting a row by pressing **spacebar** is the `shift` key - it allows users to extend the selection over multiple rows, which is handy. Checkbox clicks and the spacebar share the starting row of the range, so you can click a checkbox and then press `shift` + spacebar on another row, or the other way around.

</Note>

## Selecting all rows when the data is filtered

When some rows are filtered out, use the <DPropLink name="multiRowSelectionTarget" /> prop to decide which rows the header checkbox, the group row checkboxes and [`selectAll`](/docs/reference/row-selection-api#selectAll)/[`deselectAll`](/docs/reference/row-selection-api#deselectAll) act on:

- `'all'` (the default) - they act on all the rows in the data (or in the group), including the rows that are filtered out. The header and group checkboxes are only checked when all those rows are selected.
- `'visible'` - they act only on the rows that pass the filter. Rows that are filtered out keep their current selection. The header and group checkboxes are checked when all the visible rows are selected.

```tsx file="row-selection.snippet.tsx" region="selecting-all-rows-when-the-data-is-filtered"
```

When no rows are filtered out, both values behave the same.

<DemoTitle>Choosing which rows the selection acts on when the data is filtered</DemoTitle>
<DemoDescription>

The data is grouped by `stack` and filtered to only show TypeScript developers.

Click the header checkbox, a group checkbox or the "Select all" button, then remove the filter, to see which rows were selected with each <DPropLink name="multiRowSelectionTarget" /> value.

</DemoDescription>

```tsx file="row-selection-target-example.demo.tsx"
```

## Specify a `rowSelection` value

When multiple row selection is used, the <DPropLink name="rowSelection" /> prop should be an object that can have the following shape:

```ts file="row-selection.snippet.tsx" region="specify-a-rowselection-value"
```

As shown above, the `rowSelection.selectedRows` and `rowSelection.deselectedRows` arrays can either contain:

- primary keys of rows (which are usually strings or numbers) - any non-array value inside `rowSelection.selectedRows`/`rowSelection.deselectedRows` is considered an id/primaryKey value for a leaf row in the grouped dataset.
- arrays of group keys (can be combined with primary keys as well) - those arrays describe the path of the specified selected group. Please note that `rowSelection.selectedRows` can contain certain paths while `rowSelection.deselectedRows` can contain child paths of those paths ... or any other imaginable combination. For this kind of <DPropLink name="rowSelection" />, you need to enable <DPropLink name="useGroupKeysForMultiRowSelection" />.

<Note>
 
Row Selection only uses primary keys by default, even when you have grouped data.

For grouping however, you might want to use selection with group keys - for doing that, specify <DPropLink name="useGroupKeysForMultiRowSelection">DataSource.useGroupKeysForMultiRowSelection=true</DPropLink>.
Note that if you use selection with group keys, the selection will not be relevant/consistent when the <DPropLink name="groupBy" /> changes.

When you have both grouping and <DPropLink name="lazyLoad">lazy loading</DPropLink>, <DPropLink name="useGroupKeysForMultiRowSelection" /> must be enabled - read more about it in the note below.

</Note>

<Note>

When <DPropLink name="lazyLoad" /> is being used - this means not all available groups/rows have actually been loaded yet in the dataset - we need a way to allow you to specify that those possibly unloaded rows/groups are selected or not. In this case, the `rowSelection.selectedRows`/`rowSelection.deselectedRows` arrays should not have row primary keys as strings/numbers, but rather rows/groups specified by their full path (so <DPropLink name="useGroupKeysForMultiRowSelection" /> should be set to `true`).

```ts file="row-selection.snippet.tsx" region="specify-a-rowselection-value-2"
```

In the example above, we know that there are 3 groups (`continent`, `country`, `city`), so any item in the array that has a 4th element is a fully specified leaf node. While lazy loading, we need this fully specified path for specific nodes, so we know which group rows to render with indeterminate selection.

</Note>

### Controlled selection with checkbox column

When using the controlled <DPropLink name="rowSelection" />, make sure to specify the <DPropLink name="onRowSelectionChange" /> callback prop to update the selection accordingly as a result of user interaction.

<DemoTitle>Multi row checkbox selection with grouping</DemoTitle>
<DemoDescription>

This example shows how you can use multiple row selection with a predefined controlled value.

Go ahead and select some groups/rows and see the selection value adjust.

The example also shows how you can use the `InfiniteTableApi` to retrieve the actual ids of the selected rows.

</DemoDescription>

```tsx file="/docs/reference/controlled-multi-row-selection-example.demo.tsx"
```

## Multi Selection with Lazy Load and Grouping

Probably the most complex use-case for multi selection (with checkbox) is the combination of grouping and lazy-loading.

In this scenario, not all groups and/or rows are loaded at a given point in time, but we need to be able to know how to render each checkbox for each group - either checked, unchecked or indeterminate, all this depending on whether all children, at any nesting levels are selected or not.

In order to make this possible, the <DPropLink name="rowSelection" /> value will only contain arrays (and not individual primary keys) in the `selectedRows` and `deselectedRows` arrays and the DataSource will be configured with <DPropLink name="useGroupKeysForMultiRowSelection" />.

With lazy loading, the server knows which rows are filtered out, so it's the server that applies <DPropLink name="multiRowSelectionTarget" />. The selection keeps storing group keys and `defaultSelection`, and the <DPropLink name="data" /> function receives `multiRowSelectionTarget` in its parameters. Use it when working out which rows a stored selection covers - for `'visible'`, a selected group (or `defaultSelection: true`) only covers the rows that pass the current `filterValue`, while for `'all'`, it covers every row in the group. Changing <DPropLink name="multiRowSelectionTarget" /> doesn't reload the data.

The checkboxes count the rows that the server reports: the `totalChildrenCount` of each group (and of the top-level group response - see [server-side grouping](/docs/learn/grouping-and-pivoting/grouping-rows#server-side-grouping-with-lazy-loading)) and the `totalCount` of a response with rows. With `'all'`, the server can also send the counts without the filter, so the checkboxes count the rows hidden by the filter as well - a selected group with hidden rows that are not selected shows as partly selected:

- `totalChildrenCountUnfiltered` on each group, and on the top-level group response
- `totalCountUnfiltered` on a response with rows (not groups)

With these counts, a row or group that is selected or deselected on its own is counted with its own selection, even when the filter hides it.

Without them, or with `'visible'`, the checkboxes only count the rows that pass the filter. Once all the rows of a group are loaded, a selected (or deselected) row that the filter hides is no longer counted. Until then, it can't be told apart from a row that's not loaded yet, so it's counted with its own selection.

A group whose count is not known yet (it was never loaded) counts as one row.

<DemoTitle>Multi row checkbox selection with lazy data and grouping</DemoTitle>
<DemoDescription>

The `DataSet` has lazy loading and grouping.

The selection uses group keys (see <DPropLink name="useGroupKeysForMultiRowSelection" />), so it can specify as selected even rows/groups that have not been loaded yet.

Note in the example below that some of the group rows are partly selected, even if the leaf rows which are specified as selected in the <DPropLink name="rowSelection" /> are not yet loaded.

</DemoDescription>

```tsx file="/docs/reference/lazy-multi-row-selection-example.demo.tsx"
```
