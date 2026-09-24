---
title: Controlling column order in a React DataGrid
description: Let users drag DataGrid columns by default, then use columnOrder, defaultColumnOrder, onColumnOrderChange, and columnVisibility when your app needs saved or curated layouts.
date: 2026-09-07
author: radu
tags: columns, column-order, react-datagrid
---

Column order looks like a small interaction until the grid becomes part of a real workflow.

Support agents drag customer status next to the assignee column. Finance users keep quarter totals beside revenue. Admin screens need a compact "review" layout, then a full layout when the user opens the advanced view. A useful DataGrid should make the quick case automatic and still expose enough control for product-specific layouts.

Infinite Table does both. Column drag and drop works out of the box, and the [Column Order docs](/docs/learn/columns/column-order) show how to move from the default behavior to controlled order, persisted layouts, duplicated columns, and visibility-aware layouts.

## Drag column headers by default

You do not have to opt into column reordering. If you pass a <PropLink name="columns" /> object, Infinite Table renders those columns in object key order and lets users drag headers to rearrange them.

That default is enough when the order is user-local and does not need to be saved by the application.

```tsx
const columns = {
  firstName: { field: 'firstName' },
  country: { field: 'country' },
  salary: { field: 'salary', type: 'number' },
};

<DataSource data={data} primaryKey="id">
  <InfiniteTable columns={columns} />
</DataSource>;
```

As soon as column order becomes part of the product state - saved views, role-based layouts, dashboards, or shareable reports - make the order explicit.

## Use defaultColumnOrder for an initial layout

For an uncontrolled starting point, pass <PropLink name="defaultColumnOrder" />. Infinite Table uses it for the initial render, then keeps handling user drag interactions internally.

```tsx
<InfiniteTable
  columns={columns}
  defaultColumnOrder={['firstName', 'country', 'team', 'company']}
/>
```

This is the right fit when the app wants to choose the first layout but does not need to own every later reorder.

## Control order when the app owns the layout

Use <PropLink name="columnOrder" /> with <PropLink name="onColumnOrderChange" /> when the order should live in React state.

```tsx
const [columnOrder, setColumnOrder] = useState([
  'firstName',
  'country',
  'team',
  'company',
  'department',
  'companySize',
]);

<InfiniteTable
  columns={columns}
  columnOrder={columnOrder}
  onColumnOrderChange={setColumnOrder}
/>
```

Now every drag gesture gives the application the next order. From there you can:

- persist it to a user profile
- store it per saved report
- reset it from a toolbar button
- apply a server-provided layout for a role or workspace

<Sandpack title="Controlled column order" size="md" viewMode="preview">

<Description>

Drag the column headers and watch the `columnOrder` state update above the grid. Full docs: [Column Order](/docs/learn/columns/column-order).

</Description>

```tsx live file="$DOCS/reference/columnOrder-example.page.tsx"

```

</Sandpack>

Controlled order is also the cleanest path to "Reset layout" and "Save view" actions. The grid handles the drag mechanics; your app decides where the resulting array should be stored.

## The order array can do more than sort columns

The <PropLink name="columnOrder" /> array is deliberately flexible.

It can include only some of the columns. When it does, only those columns are displayed, which makes `columnOrder` a simple way to switch to a curated layout.

```tsx
setColumnOrder(['firstName', 'country']);
```

It can also include duplicate ids. Rendering the same field more than once is useful when two parts of a wide report need the same context column nearby.

```tsx
setColumnOrder([
  'firstName',
  'country',
  'team',
  'firstName',
  'companySize',
]);
```

And it can include ids that do not exist yet. Unknown ids are ignored, which means you can keep a saved order stable while feature-flagged or permission-gated columns appear later.

```tsx
setColumnOrder([
  'firstName',
  'country',
  'enterpriseOnlyColumn',
  'companySize',
]);
```

Use `true` to reset the controlled order back to the natural order from the <PropLink name="columns" /> object.

```tsx
setColumnOrder(true);
```

<Sandpack title="Advanced column order layouts" size="md" viewMode="preview">

<Description>

This example limits visible columns with `columnOrder`, repeats a column id, ignores an unknown id, and resets to the natural column order with `true`.

</Description>

```tsx live file="$DOCS/reference/columnOrder-advanced-example.page.tsx"

```

</Sandpack>

## Combine order with visibility

Column order and column visibility answer different questions:

- <PropLink name="columnOrder" /> decides where columns should appear when they are rendered.
- <PropLink name="columnVisibility" /> decides whether a column is rendered.

That separation matters for saved layouts. A user can hide a column today and show it again tomorrow without losing the place it had in the layout.

```tsx
<InfiniteTable
  columns={columns}
  columnOrder={columnOrder}
  onColumnOrderChange={setColumnOrder}
  columnVisibility={{
    salary: false,
  }}
/>
```

In that setup, the salary column can stay in the saved `columnOrder` array even while it is hidden. When the user makes it visible again, Infinite Table already knows where it belongs.

## A practical saved-layout pattern

A typical saved-layout flow is small:

1. Start from a product-defined order.
2. Control <PropLink name="columnOrder" /> in React state.
3. Update that state from <PropLink name="onColumnOrderChange" />.
4. Persist the array whenever the user saves the view.
5. Keep visibility separate so hidden columns can remember their position.

```tsx
const [columnOrder, setColumnOrder] = useState(savedView.columnOrder ?? true);
const [columnVisibility, setColumnVisibility] = useState(
  savedView.columnVisibility ?? {},
);

const hideSalary = () => {
  setColumnVisibility((visibility) => ({
    ...visibility,
    salary: false,
  }));
};

<InfiniteTable
  columns={columns}
  columnOrder={columnOrder}
  onColumnOrderChange={setColumnOrder}
  columnVisibility={columnVisibility}
/>
```

The important part is that the layout is data. You can store it, diff it, reset it, sync it, or apply it from a server response without reaching into the grid imperatively.

## Go deeper in the docs

- [Column Order](/docs/learn/columns/column-order) - drag-and-drop behavior, controlled and uncontrolled order, advanced order arrays
- <PropLink name="columnOrder" /> - controlled column order reference
- <PropLink name="defaultColumnOrder" /> - uncontrolled initial column order
- <PropLink name="onColumnOrderChange" /> - callback fired after users reorder columns
- <PropLink name="columnVisibility" /> - visibility layer that works together with column order
