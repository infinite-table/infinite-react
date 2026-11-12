---
title: Infinite Table Cell Selection API
layout: API
---

```tsx file="index.snippet.tsx" region="configuring-the-selection-mode-to-be-multi-cell" title="Configuring the selection mode to be 'multi-cell'"
```

<Note>

To enable cell selection, you need to specify <DPropLink name="selectionMode">selectionMode="multi-cell"</DPropLink> on the `<DataSource />` component.

</Note>

You can retrieve the cell selection api by reading it from the `api.cellSelectionApi` property.

```tsx file="index.snippet.tsx" region="intro"
```

See the [Infinite Table API page](/docs/reference/api) for the main API.
See the [Infinite Table Keyboard Navigation API page](/docs/reference/keyboard-navigation-api) for the keyboard navigation API.
See the [Infinite Table Row Selection API page](/docs/reference/row-selection-api) for the row selection API.
See the [Infinite Table Column API page](/docs/reference/column-api) for the column API.

<PropTable sort searchPlaceholder="Type to filter API methods">

<Prop name="isCellSelected" type="({rowIndex/rowId, colIndex/colId}) => boolean">

> Boolean getter to report if a cell is selected.

The accepted argument is an object with the following properties:

- `rowIndex` (the index of the row) or `rowId` (the id of the row)
- `colIndex` (the index of the column) or `colId` (the id of the column)

You can identify the cell by any of the valid combinations of `rowIndex`/`rowId` and `colIndex`/`colId`.

<Note>

Using row and column indexes for selection is supported to make it easier to use the API, but in fact cells are selected by the `rowId/colId` combination.

This is important to keep in mind, as when columns are reordered or rows are sorted/filtered - the selection will be bound to the `rowId/colId` - so cells that were selected as siblings before a column reorder might not be siblings after the reorder, but they will still be rendered as selected.

</Note>

</Prop>

<Prop name="mapCellSelectionPositions" type="(fn: (rowInfo, colId) => any, emptyValue)">

> Maps the selected cells using the passed fn.

This allows you to retrieve the values from the selected cells, by using a mapping function, so for each value (cell) in the selection, the passed `fn` is called, so you can return your own object with the values you need.

```tsx file="cell-selection-mapping-example.demo.tsx" title="Retrieving cell selection value by mapping over them" height="large"
```

</Prop>

<Prop name="selectColumn" type="(colId: string)=> void">

> Selects all cells in the specified column.

```tsx file="/docs/reference/datasource-props/controlled-cell-selection-with-api-example.demo.tsx" height="large" title="Using selectColumn with controlled selection"
```

</Prop>

<Prop name="selectCell" type="({ rowIndex/rowId, colIndex/colId, clear?: boolean}) => void">

> Selects the specified cell.

For the shape of the argument see related [isCellSelected](#isCellSelected).

Additionally, you can pass a `clear` property to clear the selection before selecting the cell.

Also see related [deselectCell](#deselectCell).

In order to select a cell via mouse interaction, simply click the desired cell. Clicking a cell without any modifier keys will clear the selection and select the clicked cell.

You can use `Cmd/Ctrl+Click` to add cells to the selection, or `Shift+Click` to select a range of cells.

```tsx file="select-cell-example.demo.tsx" title="Selecting a cell via the Cell Selection API"
```

</Prop>

<Prop name="deselectCell" type="({ rowIndex/rowId, colIndex/colId}) => void">

> Deselects the specified cell.

For the shape of the argument see related [isCellSelected](#isCellSelected).

Also see related [selectCell](#selectCell).

</Prop>

<Prop name="selectAll" type="() => void">

> Selects all cells in the DataGrid.

See related [deselectAll](#deselectAll).

</Prop>

<Prop name="deselectAll" type="() => void">

> Deselects all cells in the DataGrid.

See related [selectAll](#selectAll).

</Prop>

<Prop name="clear" type="() => void">

> An alias for [deselectAll](#deselectAll).

</Prop>

<Prop name="selectRange" type="(start, end) => void">

> Selects the specified cell range.

The `start` and `end` arguments are objects of the same shape as the argument for [isCellSelected](#isCellSelected).

In order to select a range via mouse interaction, use `Cmd/Ctrl+Click` and `Shift+Click` as you would in a spreadsheet application.

Clicking a cell without holding the modifier keys will clear the selection and select the clicked cell.

```tsx file="select-range-example.demo.tsx" title="Selecting a range via the Cell Selection API"
```

<Note>

Don't worry if the `start` or `end` are not passed in the correct order - Infinite Table will figure it out.

</Note>

For deselecting a range see [deselectRange](#deselectRange).

</Prop>

<Prop name="deselectRange" type="(start, end) => void">

> Deselects the specified cell range.

The `start` and `end` arguments are objects of the same shape as the argument for [isCellSelected](#isCellSelected).

<Note>

Don't worry if the `start` or `end` are not passed in the correct order - Infinite Table will figure it out.

</Note>

For selecting a range see [selectRange](#selectRange).

```tsx file="deselect-range-example.demo.tsx" title="Deselecting a range via the Cell Selection API"
```

</Prop>

</PropTable>
