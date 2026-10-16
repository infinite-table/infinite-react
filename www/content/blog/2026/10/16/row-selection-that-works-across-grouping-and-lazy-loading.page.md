---
title: Row selection that works across grouping and lazy loading
description: Use Infinite Table row selection for click and keyboard selection, checkbox columns, grouped rows, and lazy-loaded data without enumerating every row.
date: 2026-10-16
author: radu
tags: row-selection, selection, react-datagrid
---

Row selection looks simple until the grid stops being simple.

A single selected row is easy. The complexity shows up when users expect Finder-style range selection, a checkbox column, "select all" semantics, grouped rows, partially selected parents, and lazy-loaded data where many rows are not even in the browser yet.

Infinite Table's [row selection docs](/docs/learn/selection/row-selection) cover that full path. The important idea is that selection belongs to the `<DataSource />`, not to a local checkbox component inside a cell. The DataSource already owns primary keys, grouping, lazy loading, and the row model, so it is the right place to describe what is selected.

## Start with the selection mode

Row selection is enabled from the DataSource:

```tsx
<DataSource<Developer>
  data={dataSource}
  primaryKey="id"
  selectionMode="multi-row"
>
  <InfiniteTable<Developer> columns={columns} />
</DataSource>
```

Use <DPropLink name="selectionMode" /> when you want to be explicit. It can be `"single-row"`, `"multi-row"`, `"multi-cell"`, or `false`. In many cases Infinite Table can infer the selection mode from <DPropLink name="rowSelection" /> or <DPropLink name="defaultRowSelection" />, but setting it directly makes the interaction contract obvious when reading the component.

Single row selection stores one primary key or `null`. Multiple row selection stores an object that describes selected and deselected rows. In both cases the selected row identity is based on the DataSource <DPropLink name="primaryKey" />.

That is the first useful constraint: do not model selection by viewport index. Rows can be sorted, filtered, grouped, virtualized, or loaded later. A primary key survives all of those changes.

## Let clicks and the keyboard do the expected thing

For multi-row selection, Infinite Table mirrors the selection gestures people already know from file managers:

- click a row to select it and clear the previous selection
- click with `cmd` / `ctrl` to toggle one row while keeping the rest
- click with `shift` to extend the selection range from the last non-shift selection
- use the spacebar with keyboard navigation to apply the same selection behavior from the active row

That last part matters for dense admin screens. Selection should not become mouse-only just because the table is virtualized or because rows are frequently changing.

By default, <PropLink name="keyboardSelection" /> is enabled. If your product has a mode where the spacebar should do something else, you can turn it off or make it conditional.

<Sandpack title="Multi row selection with keyboard support" size="md" viewMode="preview">

<Description>

Move through the grid and use the spacebar, optionally with `cmd` / `ctrl` / `shift`, to change the row selection.

</Description>

```tsx live file="$DOCS/reference/default-selection-mode-multi-row-keyboard-toggle-example.page.tsx"

```

</Sandpack>

## Add a checkbox column where selection belongs

Checkbox selection is usually the clearest UI for multi-row selection, especially when a page has bulk actions. In Infinite Table, any column can render the selection checkbox:

```tsx
const columns = {
  id: {
    field: 'id',
    renderSelectionCheckBox: true,
    defaultWidth: 80,
  },
  country: {
    field: 'country',
  },
};
```

Set <PropLink name="columns.renderSelectionCheckBox" /> to `true` for the default checkbox, or provide a render function when the checkbox needs custom markup.

The header checkbox follows the same selection model. It can show checked, unchecked, or indeterminate state depending on the current selection. You can customize it with <PropLink name="columns.renderHeaderSelectionCheckBox" />, and if you do not, the column selection checkbox configuration is reused for the header.

<Sandpack title="Multi row selection with a checkbox column" size="md" viewMode="preview">

<Description>

Click row checkboxes or the header checkbox. You can still use keyboard selection while the checkbox column is visible.

</Description>

```tsx live file="$DOCS/reference/default-checkbox-selection-multi-row-example.page.tsx"

```

</Sandpack>

The practical result is that checkbox selection is not a second selection system. It is another way to update the same DataSource selection state.

## Use include and exclude selection for large data

A common mistake in grid selection is to treat "select all" as "put every row id into an array". That falls apart for big data, filtered data, and lazy-loaded data.

Multiple row selection uses a shape that can describe either side of the set:

```ts
const rowSelection = {
  selectedRows: [3, 6, 100, 23],
  defaultSelection: false,
};

const allExceptSomeRows = {
  deselectedRows: [3, 6, 100, 23],
  defaultSelection: true,
};
```

`defaultSelection: false` means "nothing is selected unless it is listed". `defaultSelection: true` means "everything is selected unless it is listed as deselected".

That gives you cheap "select all" semantics. You do not need to enumerate 100k primary keys just because a user selected the header checkbox.

## Group rows can be selected by their path

Grouped data adds another layer: users expect parent groups to be selectable, and they expect parents to become indeterminate when only some descendants are selected.

For grouped rows, enable <DPropLink name="useGroupKeysForMultiRowSelection" /> and include group-key paths in `selectedRows` or `deselectedRows`:

```ts
const rowSelection = {
  selectedRows: [
    ['Europe', 'France'],
    ['Asia'],
    45,
  ],
  deselectedRows: [
    ['Europe', 'France', 'Paris'],
  ],
  defaultSelection: false,
};
```

In that example, the France group is selected, the Paris subgroup is deselected, and row `45` is selected by primary key. You can mix primary keys and group paths when the data is available locally.

The row selection API can also resolve group-path selection back to primary keys when you need to submit a bulk action:

```tsx
const selectedIds =
  api.rowSelectionApi.getSelectedPrimaryKeys(rowSelection);
```

<Sandpack title="Controlled multi row selection with grouped rows" size="lg" viewMode="preview">

<Description>

The selection value includes group paths and primary keys. The example also shows the selected primary keys derived through the row selection API.

</Description>

```tsx live file="$DOCS/reference/controlled-multi-row-selection-example-with-group-keys.page.tsx"

```

</Sandpack>

## Lazy loading needs full paths

Lazy loading is the case where the DataSource may not know all rows yet. A group can be expanded later, or a child row may live under parents that are not loaded in the current browser state.

For lazy-loaded grouped data, describe selected rows and groups with paths. If the data is grouped by `continent`, `country`, and `city`, a leaf row path includes those group keys plus the primary key:

```ts
const rowSelection = {
  selectedRows: [
    ['Europe', 'Italy', 'Rome', 45],
    ['Europe', 'France'],
    ['Asia'],
  ],
  deselectedRows: [
    ['Europe', 'Italy', 'Rome'],
  ],
  defaultSelection: false,
};
```

That lets Infinite Table render correct checked and indeterminate state even before every descendant row has been loaded. It also keeps the selection meaningful across server-side group expansion because the value describes the data hierarchy, not the current viewport.

<Sandpack title="Multi row selection with lazy data and grouping" size="lg" viewMode="preview">

<Description>

The DataSource uses lazy loading and grouped data. Selection is described with group paths so unloaded rows and groups can still be represented.

</Description>

```tsx live file="$DOCS/reference/lazy-multi-row-selection-example.page.tsx"

```

</Sandpack>

## When to use controlled selection

Use uncontrolled selection when the grid owns the interaction and no other part of the page needs to know about it:

```tsx
<DataSource
  defaultRowSelection={{
    selectedRows: [3, 6],
    defaultSelection: false,
  }}
/>
```

Use controlled selection when selection drives product behavior:

- enabling or disabling a bulk action toolbar
- showing a count outside the grid
- syncing selection to URL state
- submitting selected rows to an API
- preserving selection while changing grouping or filters

The controlled setup is the same React pattern you would expect:

```tsx
const [rowSelection, setRowSelection] = React.useState({
  selectedRows: [],
  defaultSelection: false,
});

<DataSource
  rowSelection={rowSelection}
  onRowSelectionChange={setRowSelection}
/>
```

Keep in mind that if grouping changes and your selection uses group keys, the meaning of those paths changes too. That is usually a product decision: either clear selection when grouping changes, or map the old selection into the new grouping model.

## The mental model

Think of row selection as a data query, not as a visual detail.

The DataSource needs to answer "is this row or group selected?" for rows that are visible now, rows that are grouped under a parent, and rows that may be loaded later. The row selection value gives it enough information to answer that question without depending on the current render window.

Start with the [row selection guide](/docs/learn/selection/row-selection), then choose the smallest model that matches your product:

- single primary key for single row selection
- selected primary keys for local multi-row selection
- `defaultSelection: true` with exclusions for select-all workflows
- group-key paths for grouped data
- full group paths plus primary keys for lazy-loaded grouped data

Once that selection state is in the DataSource, clicks, keyboard shortcuts, checkbox cells, group rows, and lazy loading all update the same model.
