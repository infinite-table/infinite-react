---
title: 'Infinite Table React DataGrid version 3.0.0 released'
description: 'InfiniteTable DataGrid for React version 3.0.0 brings many small fixes and enhancements, along with a major new feature: cell selection'
author: [admin]
date: 2023-10-02
---

Version `3.0.0` is a release that brings a long awaited feature: cell selection. This allows the user to perform fined-grained cell selection, either via the <DPropLink name="cellSelection"/> prop or via the [Cell Selection API](/docs/reference/cell-selection-api).

<Note title="Version 3.0.0 highlights 🎉">

1️⃣ [support for single and multiple cell selection](#1-support-for-single-and-multiple-cell-selection)
2️⃣ [cell selection using wildcards](#2-cell-selection-using-wildcards)
3️⃣ [cell selection API](#3-cell-selection-api)

</Note>

## 1️⃣ Support for single and multiple cell selection

It's been a [long-requested feature to implement cell selection](https://github.com/infinite-table/infinite-react/issues/120).

We knew we needed to implement it, but we wanted to do it right while keeping it easy to understand.

In fact, we prepared some things in advance - namely <DPropLink name="selectionMode" /> was there, it just needed to accept a new value: `"multi-cell"`.

```tsx title="Configuring multi-cell selection"
<DataSource<Developer>
  selectionMode="multi-cell" // <--- THIS
  primaryKey="id"
  data={[...]}
/>
```

The line above is all you need to do to enable cell selection. This allows the user to `Click` or `Cmd/Ctrl+Click` to select a specific cell and `Shift+Click` to select a range of cells. It's exactly the behavior you'd expect from a spreadsheet application.

Try `Cmd/Ctrl+Click`ing in the DataGrid cells below to see multiple cell selection in action.

<CSEmbed title="SelectionMode set to 'multi-cell' to allow cell selection" id="sorting-group-columns-forked-qnvwwh" />

### Using a default selection

If you want to render the DataGrid with a default selection, you can use the <DPropLink name="defaultCellSelection" /> prop.

```tsx
const defaultCellSelection = {
  defaultSelection: false,
  selectedCells: [
    [3, 'hobby'],
    [4, 'firstName'],
    [4, 'hobby'],
    [4, 'preferredLanguage'],
    [4, 'salary'],
  ],
};
```

The format for the uncontrolled <DPropLink name="defaultCellSelection" /> (and also for the controlled <DPropLink name="cellSelection" />) is an object with two properties:

- `defaultSelection` - `boolean` - whether or not cells are selected by default.
- and either
  - `selectedCells` - `[string|number, string][]` - only needed when `defaultSelection` is `false`
- or
  - `deselectedCells` - `[string|number, string][]` - only needed when `defaultSelection` is `true`

The value for `selectedCells` and `deselectedCells` should be an array of `[rowId, colId]` tuples.

The `rowId` is the `id` of the row (<DPropLink name="primaryKey" code={false}>the primary key</DPropLink>), and the `colId` is the `id` of the column (the identifier of the column in the <PropLink name="columns" /> prop).

This object shape for the <DPropLink name="defaultCellSelection" />/<DPropLink name="cellSelection" /> props allows you full flexibility in specifying the selection. You can specify a single cell, a range of cells, or even a non-contiguous selection. You can default to everything being selected, or everything being deselected and then enumerate your specific exceptions.

<CSEmbed title="Specifying a default cell selection in Infinite Table" id="cell-selection-with-default-value-in-infinite-table-fzdhwr" />

## 2️⃣ Cell Selection using wildcards

The above examples show how to select specific cells, but what if you want to select all cells in a column, or all cells in a row?

Well, that turns out to be straightforward as well. You can use the `*` wildcard to select all cells in a column or all cells in a row.

```tsx title="All cells in row with id rowId3 and all cells in hobby column are selected"
const defaultCellSelection = {
  defaultSelection: false,
  selectedCells: [
    ['*', 'hobby'],
    ['rowId3', '*'],
  ],
}
<DataSource selectionMode="multi-cell" defaultCellSelection={defaultCellSelection} />
```

<CSEmbed title="Cell selection using wildcards" id="cell-selection-with-wildcards-in-infinite-table-48rs75" />

Wildcard selection is really powerful and it allows you to select lots of cells without the need to enumerate them all.

For example, you can easily select all cells except a few.

### Listening to selection changes

You can listen to selection changes by using the <DPropLink name="onCellSelectionChange" /> prop.

If you're using controlled cell selection, you have to update the <DPropLink name="cellSelection" /> prop yourself in response to user interaction - so <DPropLink name="onCellSelectionChange" /> will be your way of listening to selection changes.

## 3️⃣ Cell Selection API

In addition to managing cell selection declaratively, which we encourage, you can also use the [Cell Selection API](/docs/reference/cell-selection-api) to imperatively update the current selection.

We offer the following methods:

- <CellApiLink name="selectCell" /> - selects a single cell, while allowing you to keep or to clear previous selection
- <CellApiLink name="deselectCell" /> - deselects the specified cell
- <CellApiLink name="selectColumn" /> - selects a whole column in the DataGrid
- <CellApiLink name="deselectColumn" /> - deselects the specified column
- <CellApiLink name="selectRange" /> - selects a range of cells
- <CellApiLink name="deselectRange" /> - deselects the specified range of cells
- <CellApiLink name="selectAll" /> - selects all cells in the DataGrid
- <CellApiLink name="clear" /> - clears selection (deselects all cells in the DataGrid)
- <CellApiLink name="isCellSelected" /> - checks if the specified cell is selected or not

## Conclusion

We'd love to hear your feedback - what do you think we've got right and what's missing. Please reach out to us via email at <a href="mailto:admin@infinite-table.com" className=" text-glow " > admin@infinite-table.com </a> or follow us [@get_infinite](https://twitter.com/get_infinite) to keep up-to-date with news about the product.

Talk soon 🙌
