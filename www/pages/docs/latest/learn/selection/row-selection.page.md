---
title: Row Selection
description: InfiniteTable DataGrid component supports single and multiple row selection, including checkbox column selection and lazy rows selection
---

`InfiniteTable` offers support for both single and multiple row selection. Multiple row selection allows people to select rows just like they would in their MacOS Finder app, by clicking desired rows and using the cmd/shift keys as modifiers.

The DataGrid also offers support for **checkbox selection**, which is another easy way of interacting with grid rows, especially when grouped/nested data is used.

Row selection (both single and multiple) is driven by the <DPropLink name="rowSelection" /> prop

<Note>

Row selection is defined on the `DataSource` component, so that's where you specify your <DPropLink name="rowSelection" /> prop (or the uncontrolled version of it, namely <DPropLink name="defaultRowSelection" />).

</Note>

<Note>

You can explicitly specify the <DPropLink name="selectionMode" /> as `"single-row"` or `"multi-row"` (or `false`) but it will generally be deduced from the value of your <PropLink name="rowSelection" />/<PropLink name="defaultRowSelection" /> prop.

</Note>

# Single Row Selection

This is the most basic row selection - in this case <PropLink name="rowSelection" /> prop will be a string or a number (or `null` for no selection).


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

Row selection can be used as a <PropLink name="rowSelection" code={false}>controlled</PropLink> or <PropLink name="defaultRowSelection" code={false}>uncontrolled</PropLink> property. For the controlled version, make sure you also define your <PropLink name="onRowSelectionChange" /> callback prop to update the selection.

<Sandpack title="Controlled single row selection">

<Description>

This example uses <PropLink name="onRowSelectionChange" /> callback prop to update the controlled <PropLink name="rowSelection" />

</Description>


```ts file=../../reference/controlled-single-row-selection-example.page.tsx
```

</Sandpack>


