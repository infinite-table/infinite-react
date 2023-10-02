---
title: Cell Selection
description: InfiniteTable DataGrid component supports single and multiple cell selection.
---


To use multi-cell selection, you need to configure the `<DataSource />` component with `selectionMode="multi-cell"` - see <DPropLink name="selectionMode" /> for details. For selecting rows, see the [Row Selection](/docs/learn/selection/row-selection) page.

```tsx title="Configuring the selection mode"
<DataSource selectionMode="multi-cell" />

// can be "single-row", "multi-row", "multi-cell" or false
```

<Sandpack title="Multiple cell selection example">

<Description>

Click cells in the grid to add to the selection.

Use `Shift+Click` to select a range of cells and `Cmd/Ctrl+Click` to add single cells to the selection.

</Description>

```ts file="./cell-selection-default-example.page.tsx"

```

</Sandpack>


## Using default selection

You can specify a default value for cell selection by using the <DPropLink name="defaultCellSelection" /> prop.

```tsx title="Using default selection"

const defaultCellSelection = {
  defaultSelection: false,
  selectedCells: [
    [3, "stack"], // rowId + colId
    [5, "stack"], // rowId + colId
    [0, "firstName"], // rowId + colId
  ]
}

<DataSource
  selectionMode="multi-cell"
  defaultCellSelection={defaultCellSelection}
/>
```

<Note>

Cell selection uses `[rowId, colId]` cell descriptors to identify cells to be marked as selected or deselected - read more in the [Cell selection format](#cell-selection-format).

</Note>


<Sandpack title="Multiple cell selection with a default selection value">

<Description>

By default some cells are already selected in the grid below, by using the <DPropLink name="defaultCellSelection" /> prop on the `<DataSource />` component.

</Description>

```ts file="./cell-selection-default-selection-example.page.tsx"

```
</Sandpack>

Whe you're using cell selection with or without any default value (via the <DPropLink name="defaultCellSelection" />), you're using an uncontrolled prop. This means that the selection state is managed by the `<DataSource />` component and not by you. If you want to control the selection state yourself, you can use the controlled <DPropLink name="cellSelection" /> prop instead - see [Using controlled selection](#using-controlled-selection) for details.

## Cell selection format

The <DPropLink name="cellSelection" /> prop is an object with the following shape:

 * `defaultSelection` - `boolean` - whether or not cells are selected by default.
 * either:
    * `selectedCells`: `[rowId, colId][]` - an array of cells that should be selected (this is combined with `defaultSelection: false`)
 * or
    * `deselectedCells`: `[rowId, colId][]` - an array of cells that should be deselected (this is combined with `defaultSelection: true`)

<Note>

When `defaultSelection` is `true`, you will only need to specify the `deselectedCells` prop.

And when `defaultSelection` is `false`, you will only need to specify the `selectedCells` prop.

</Note>

In this way, you can either specify which cells should be selected or which cells should be deselected - and have a default that matches the most common case.

<Note>

The `selectedCells`/`deselectedCells` are arrays of `[rowId, colId]` tuples. The `rowId` is the `id` of the row (<DPropLink name="primaryKey" code={false}>the primary key</DPropLink>), and the `colId` is the `id` of the column (the identifier of the column in the <PropLink name="columns" /> prop).

</Note>

The following scenarios are all possible:

```tsx title="Just a few specified cells are selected"
const defaultCellSelection = {
  defaultSelection: false,
  selectedCells: [
    ['id2', 'stack'],
    ['id2', 'stack'],
    ['id0', 'firstName'],
  ],
}
```

```tsx title="Everything is selected, except a few cells"
const defaultCellSelection = {
  defaultSelection: true,
  deselectedCells: [
    ['row2', 'stack'],
    ['row3', 'stack'],
    ['row5', 'firstName'],
  ],
}
```

### Using wildcards for selection

It's also possible to use wildcards for selecting cells. This is useful if you want to select all cells in a column, or all cells in a row.

```tsx title="Selecting all cells in a column"
const defaultCellSelection = {
  defaultSelection: false,
  selectedCells: [
    ['*', 'stack'],
    ['row2','firstName']
  ],
}
```

```tsx title="Selecting all cells in a row"
const defaultCellSelection = {
  defaultSelection: false,
  selectedCells: [
    ['row1', '*'],
    ['row2','firstName']
  ],
}
```


```tsx title="Selecting everything except a column"
const defaultCellSelection = {
  defaultSelection: true,
  deselectedCells: [
    ['*', 'stack'],
  ],
}
```

## Using controlled selection

When using the controlled <DPropLink name="cellSelection" /> you have to update the value of the property yourself, by listening to the <DPropLink name="onCellSelectionChange" /> event.


<Sandpack title="Using controlled cell selection" size="lg">

<Description>

This example shows how to use the <DPropLink name="onCellSelectionChange" /> callback prop to listen to changes to the controlled <DPropLink name="cellSelection" /> prop on the `<DataSource />` component.

</Description>

```ts file="./controlled-cell-selection-example.page.tsx"

```
</Sandpack>

## Using the Cell Selection API

The `<DataSource />` component also exposes a [Cell Selection API](/docs/reference/cell-selection-api), which you can use to select and deselect cells programmatically.



<Sandpack title="Using the CellSelectionAPI to select a column" size="lg">

```ts file="$DOCS/reference/datasource-props/controlled-cell-selection-with-api-example.page.tsx"

```

</Sandpack>