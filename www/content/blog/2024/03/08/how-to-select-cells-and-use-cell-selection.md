---
title: How to use single and multiple cell selection
author: admin
---

This article will cover some popular cell-selection scenarios in Infinite React DataGrid.

## Multiple cell selection

By far, the most common use-case for cell selection is multiple cell selection.
For this, you need to configure the <DPropLink name="selectionMode" /> prop on the `<DataSource />` component to use `"multi-cell"`.

<Note>

In addition, if you want to specify a default value for cell selection, you can use the <DPropLink name="defaultCellSelection" /> prop - or the controlled alternative <DPropLink name="cellSelection" />, in which case also make sure you update the value when <DPropLink name="onCellSelectionChange" /> is called.

</Note>

```tsx
<DataSource selectionMode="multi-cell" />
```

<CSEmbed code={20} id="little-wood-55dysw" />

When multiple cell selection is configured in the React DataGrid, the user can select cells by `CMD`/`CTRL` clicking to add a single cell to the selection or by `SHIFT` clicking to select a range of cells.

## Showing a chart based on selected cells

Let's implement a common use-case for multiple cell selection - showing charts based on the selected cells, for example, a bar chart, with names on the x axis and ages on the y axis.

<CSEmbed code={20} id="funny-silence-2v9r2t" />

In this example, to retrieve the values from the selected cells, we used the <CellApiLink name="mapCellSelectionPositions" /> from the [cell selection API](/docs/reference/cell-selection-api).

## Cell selection format

The <DPropLink name="cellSelection" /> prop is an object with the following shape:

- `defaultSelection` - `boolean` - whether or not cells are selected by default.
- either:
  - `selectedCells`: `[rowId, colId][]` - an array of cells that should be selected (this is combined with `defaultSelection: false`)
- or
  - `deselectedCells`: `[rowId, colId][]` - an array of cells that should be deselected (this is combined with `defaultSelection: true`)

<Note>

When `defaultSelection` is `true`, you will only need to specify the `deselectedCells` prop.

And when `defaultSelection` is `false`, you will only need to specify the `selectedCells` prop.

</Note>

In this way, you can either specify which cells should be selected or which cells should be deselected - and have a default that matches the most common case.

<Note>

The `selectedCells`/`deselectedCells` are arrays of `[rowId, colId]` tuples. The `rowId` is the `id` of the row (<DPropLink name="primaryKey" code={20}>the primary key</DPropLink>), and the `colId` is the `id` of the column (the identifier of the column in the <PropLink name="columns" /> prop).

</Note>

## Using include-lists and exclude-lists for specifying cell selection

As already demonstrated in the previous snippet, you can pass a <DPropLink name="defaultCellSelection" code={20}>default value for cell selection</DPropLink>.

In addition to listing or excluding specific cells from selection, you can use wildcards:

```tsx title="Include-list: selecting all cells in a column"
const defaultCellSelection = {
  defaultSelection: false, // all cells are deselected by default
  selectedCells: [
    // all cells in the stack column
    ['*', 'stack'],
    // also this specific cell
    ['row2', 'firstName'],
  ],
};
```

```tsx title="Include-list: selecting all cells in a row"
const defaultCellSelection = {
  defaultSelection: false, // all cells are deselected by default
  selectedCells: [
    // all cells in the row
    ['row1', '*'],
    // also this specific cell
    ['row2', 'firstName'],
  ],
};
```

```tsx title="Exclude-list: selecting everything except a column"
const defaultCellSelection = {
  defaultSelection: true, // all cells are selected by default
  deselectedCells: [['*', 'stack']],
};
```

<CSEmbed code={20} id="throbbing-platform-s9jtd4" title="Using wildcard selection to select whole cell or row"/>

## Single cell selection

Single cell selection is not common - what you probably want to use in this case is the <PropLink name="activeCellIndex" /> prop to emulate single cell selection - but that's basically cell navigation.
