---
title: Infinite Table Cell Selection API
layout: API
---

<Note>

To enable cell selection, you need to specify `selectionMode="multi-cell"` on the `<DataSource />` component.

</Note>

You can retrieve the cell selection api by reading it from the `api.cellSelectionApi` property.



```tsx {4}

const onReady = ({api}: {api:InfiniteTableApi<DATA_TYPE>}) => {
  // do something with it
  api.cellSelectionApi.selectGroupRow(['USA'])
}

<InfiniteTable<DATA_TYPE>
  columns={[...]}
  onReady={onReady}
/>
```

See the [Infinite Table API page](/docs/reference/api) for the main API.
See the [Infinite Table Row Selection API page](/docs/reference/row-selecti-api) for the row selection API.
See the [Infinite Table Column API page](/docs/reference/column-api) for the column API.

<PropTable sort searchPlaceholder="Type to filter API methods">

<Prop name="isCellSelected" type="({rowIndex/rowId, colIndex/colId}) => boolean">

> Boolean getter to report if a cell is selected.

The accepted argument is an object with the following properties:

 - `rowIndex` (the index of the row) or `rowId` (the id of the row)
 - `colIndex` (the index of the column) or `colId` (the id of the column)

You can identify the cell by any of the valid combinations of `rowIndex`/`rowId` and `colIndex`/`colId`.

</Prop>

<Prop name="selectCell" type="({ rowIndex/rowId, colIndex/colId, clear?: boolean}) => void">

> Selects the specified cell.

For the shape of the argument see related [isCellSelected](#isCellSelected).

Additionally, you can pass a `clear` property to clear the selection before selecting the cell.

Also see related [deselectCell](#deselectCell).

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

</Prop>


</PropTable>
