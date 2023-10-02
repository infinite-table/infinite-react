---
title: Cell Selection
description: InfiniteTable DataGrid component supports single and multiple cell selection.
---


To use multi-cell selection, you need to configure the `<DataSource />` component with `selectionMode="multi-cell"` - see <DPropLink name="selectionMode" /> for details.

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

The cell selection 

</Note>


<Sandpack title="Multiple cell selection with a default selection value">

<Description>

By default some cells are already selected in the grid below, by using the <DPropLink name="defaultCellSelection" /> prop on the `<DataSource />` component.

</Description>

```ts file="./cell-selection-default-selection-example.page.tsx"

```

</Sandpack>