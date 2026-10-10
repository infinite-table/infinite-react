---
title: Wrapping rows horizontally in a React DataGrid
description: Use Infinite Table horizontal layout to wrap rows into repeated column sets, preserve grouped context, and render column-set-aware headers.
date: 2026-10-10
author: radu
tags: horizontal-layout, react-datagrid, layout
---

Most DataGrids solve overflow by giving you a vertical scrollbar, a horizontal scrollbar, or both. That is the right default for dense data entry, but it is not always the right reading layout.

Some screens need a more newspaper-like layout: a short set of columns repeated across the available width, with records flowing from the first column set into the next. Think monitoring dashboards, compact rosters, contact lists, schedule views, or review queues where the user scans many similarly shaped records and the row height is the limiting factor.

Infinite Table documents this as [horizontal layout](/docs/reference/infinite-table-props), powered by <PropLink name="wrapRowsHorizontally" />.

## What horizontal layout changes

In the normal layout, every row spans the same full column model and scrolling moves through the dataset vertically.

With <PropLink name="wrapRowsHorizontally" /> enabled, Infinite Table wraps rows horizontally to fit the container. The configured columns are repeated for each wrapped section, which the docs call **column sets**.

For example, if the grid has three columns and 25 rows, but only 10 rows fit vertically:

- the first column set renders rows 1-10
- the second column set repeats the same three columns for rows 11-20
- the third column set repeats the columns again for rows 21-25

That lets the user consume more records at once without turning each record into a custom card component.

```tsx
<DataSource<Developer> primaryKey="id" data={dataSource}>
  <InfiniteTable<Developer>
    columns={columns}
    wrapRowsHorizontally
    columnDefaultWidth={100}
  />
</DataSource>
```

<Sandpack title="Horizontal layout in a React DataGrid" size="md" viewMode="preview">

<Description>

Toggle horizontal layout to see rows flow into repeated column sets. The same example is used in the <PropLink name="wrapRowsHorizontally" /> docs.

</Description>

```tsx live file="$DOCS/reference/horizontal-layout-example.page.tsx"

```

</Sandpack>

## Use it when rows are the thing being scanned

Horizontal layout works best when the grid has a small, stable set of columns and the user's task is to scan many rows quickly.

Good candidates:

- queues with id, owner, and age
- compact people or contact lists
- inventory bins with location and quantity
- dashboards where every row has the same few status fields
- tree or grouped views where parent context should stay visible while rows wrap

It is usually not the right fit for a wide analytics table with many measures. In that case, normal horizontal scrolling, column pinning, column groups, or pivoting usually give users a clearer mental model.

<Note>

When horizontal layout is enabled, columns cannot use flexible widths. Avoid <PropLink name="columns.defaultFlex" /> and use fixed/default widths instead.

</Note>

## Keep grouped context visible

Wrapping rows gets more interesting with grouping and tree data. If a group starts in one column set and its child rows continue in the next one, the user still needs to know which group they are reading.

That is what <PropLink name="repeatWrappedGroupRows" /> controls. When grouping or tree data is active, repeated group/tree rows can be rendered at the top of wrapped column sets so context is not lost.

```tsx
<DataSource<Developer>
  primaryKey="id"
  data={dataSource}
  defaultGroupBy={[{ field: 'country' }, { field: 'city' }]}
>
  <InfiniteTable<Developer>
    columns={columns}
    wrapRowsHorizontally
    repeatWrappedGroupRows
  />
</DataSource>
```

The prop also accepts a function, so advanced layouts can decide which group or tree levels should repeat.

<Sandpack title="Horizontal layout with repeated group rows" size="md" viewMode="preview">

<Description>

Toggle repeated group rows to see how country/city context is preserved when grouped rows continue into another column set.

</Description>

```tsx live file="$DOCS/reference/horizontal-layout-repeat-wrapped-groups-example.page.tsx"

```

</Sandpack>

TreeGrid uses the same idea. The [TreeGrid overview](/docs/learn/tree-grid/overview#working-with-horizontal-layout) shows <PropLink name="wrapRowsHorizontally" /> applied to hierarchical rows, and <PropLink name="repeatWrappedGroupRows" /> can be used to repeat parent rows when wrapping crosses a tree boundary.

## Render headers for each column set

Sometimes repeated columns need slightly different labels. The column render functions receive `horizontalLayoutPageIndex`, which is `null` when horizontal layout is disabled and a zero-based number when the column is being rendered inside a wrapped column set.

That gives headers and cells enough context to show a section number, alternate content, or hide repeated decoration after the first set.

```tsx
const getColumnHeaderFor = (label: string) => {
  return ({ horizontalLayoutPageIndex }) => {
    return (
      <>
        {label}
        {horizontalLayoutPageIndex != null
          ? ` (${horizontalLayoutPageIndex + 1})`
          : ''}
      </>
    );
  };
};

const columns = {
  id: { field: 'id', header: getColumnHeaderFor('ID') },
  firstName: { field: 'firstName', header: getColumnHeaderFor('Name') },
  age: { field: 'age', header: getColumnHeaderFor('Age') },
};
```

<Sandpack title="Column-set-aware headers" size="md" viewMode="preview">

<Description>

Each repeated header receives the current column set index and renders it next to the label.

</Description>

```tsx live file="$DOCS/reference/horizontal-layout-with-column-set-index-in-header-example.page.tsx"

```

</Sandpack>

## A practical configuration checklist

When you try horizontal layout in your app, start with this sequence:

1. Keep the column list short.
2. Give columns fixed or default widths.
3. Enable <PropLink name="wrapRowsHorizontally" />.
4. If grouping or tree data is active, decide how <PropLink name="repeatWrappedGroupRows" /> should behave.
5. Use `horizontalLayoutPageIndex` only when repeated headers or cells need extra context.

That keeps the feature focused on its main purpose: showing more row records in the same viewport while preserving the DataGrid behaviors you already configured.

## Go deeper in the docs

- <PropLink name="wrapRowsHorizontally" /> — the main horizontal layout prop and examples
- <PropLink name="repeatWrappedGroupRows" /> — control repeated group/tree rows across wrapped column sets
- [TreeGrid horizontal layout](/docs/learn/tree-grid/overview#working-with-horizontal-layout) — use the same layout mode with hierarchical data
- [Performance with many rows and columns](/docs/learn/examples/performance-many-rows-and-columns) — use the default layout when the goal is large two-dimensional scrolling
