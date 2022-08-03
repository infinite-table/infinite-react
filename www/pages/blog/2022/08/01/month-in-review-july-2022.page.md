---
title: "Month in review - July 2022"
author: [admin]
---
In July, we've been hard at work preparing for our Autumn release, and have implemented a few new functionalities:

 * column resizing is now available
 * column reordering via drag & drop
 * keyboard navigation with support for both row and cell navigation


<Note title="Coming soon">

At the end of July we started working on row and cell selection and we've made good progress on it.

Row selection is already implemented for non-lazy group data and we're working on integrating it with lazy group data (e.g groups lazily loaded from the server). Of course, it will have integration with checkbox selection.

Multiple row selection will have 2 ways to select data:
 - via mouse/keyboard interaction - we've emulated the behavior you're used to from your Finder in MacOS.
 - via checkbox - this is especially useful when the table is configured with grouping.

</Note>

### Column Resizing

By default columns are resizable. You can control this at column level via <PropLink name="columns.resizable">column.resizable</PropLink> or at grid level via <PropLink name="resizableColumns" />.

<Sandpack title="Resizable columns example">

<Description>
For resizable columns, hover the mouse between column headers to grab & drag the resize handle.

Hold SHIFT when grabbing in order to **share space on resize**.
</Description>

```ts file=../../../../docs/latest/reference/resizableColumns-example.page.tsx
```
</Sandpack>

A nice feature is support for SHIFT resizing - which will share space on resize between adjacent columns - try it in the example above.


### Column Reordering

The default column order is the order in which columns appear in the columns object, but you can specify a <PropLink name="defaultColumnOrder" /> or tightly control it via the controlled property <PropLink name="columnOrder" /> - use <PropLink name="onColumnOrderChange" /> to get notifications when columns are reordered by the user.

<Sandpack title="Column order">

```ts file=../../../../docs/latest/reference/columnOrder-advanced-example.page.tsx
```

</Sandpack>

### Keyboard Navigation

Both cell and row navigation is supported - use <PropLink name="keyboardNavigation" /> to configure it. By default, cell navigation is enabled.


<Sandpack title="Keyboard navigation">

<Description>

This example starts with cell `[2,0]` already active.

</Description>

```ts file=../../../../docs/latest/learn/keyboard-navigation/navigating-cells-uncontrolled-example.page.tsx
```

</Sandpack>