---
title: Horizontal layout for React DataGrids
description: Use Infinite Table's horizontal layout to wrap rows into repeated column sets, preserve grouped and tree context, and build dense React DataGrid views without reshaping your data.
date: 2026-09-16
author: radu
tags: layout, react-datagrid, tree-grid
---

Most DataGrids are designed around one simple assumption: columns go left to right, rows go top to bottom, and the user scrolls vertically through the dataset.

That is the right default for many admin screens, but it is not the only useful layout. Some UIs have more horizontal room than vertical room. Think about operations dashboards on wide displays, compact side panels, queue monitors, shortlist comparisons, or file explorers where users need to scan several small records at once.

Infinite Table's horizontal layout lets rows wrap into repeated column sets while the DataSource keeps doing the same work: loading, sorting, filtering, grouping, tree expansion, selection, and rendering cells.

The feature starts with <PropLink name="wrapRowsHorizontally" />.

## What horizontal layout changes

Set <PropLink name="wrapRowsHorizontally" /> on `<InfiniteTable />` and the grid changes how it lays out rows inside the viewport.

```tsx
<DataSource<Developer> primaryKey="id" data={dataSource}>
  <InfiniteTable<Developer>
    columns={columns}
    wrapRowsHorizontally
  />
</DataSource>
```

Instead of rendering one vertical row stack, Infinite Table fills the available height with as many rows as fit, then starts another copy of the same columns to the right. The docs call each repeated block a column set.

For example, if your grid has 3 columns, the viewport fits 10 rows, and the DataSource has 25 rows, horizontal layout renders:

- column set 1: rows 1-10
- column set 2: rows 11-20
- column set 3: rows 21-25

The columns are repeated for each set. The data pipeline is not. You do not split the array, create card groups, or build a custom masonry view. Infinite Table keeps the row model intact and changes the viewport geometry.

<Sandpack title="Horizontal layout in a React DataGrid" size="md" viewMode="preview">

<Description>

Toggle horizontal layout on and off. When enabled, rows wrap into repeated column sets that use the same column definitions.

</Description>

```tsx live file="$DOCS/reference/horizontal-layout-example.page.tsx"

```

</Sandpack>

This is especially useful when every row has only a few important fields. A three-column "ID / name / age" grid can use a wide viewport much better by showing several row stacks side by side.

## Think in column sets, not custom cards

Horizontal layout is still a DataGrid layout. That means it keeps the capabilities you expect from Infinite Table:

- columns keep their renderers, headers, sizing, sorting, menus, and styles
- rows still come from the same <DataSourcePropLink name="data" /> pipeline
- keyboard navigation and selection still operate on row and column indexes
- grouping and tree rows still belong to the same row model

The difference is that the virtualizer uses the viewport height to decide how many rows fit in one set, then repeats the configured columns for the next set.

There is one important constraint from the docs: do not use flexible column widths in horizontal layout. Avoid <PropLink name="columns.defaultFlex" /> and use fixed widths instead, because each repeated set needs a stable width.

## Label each repeated set when it helps

Because the same headers repeat, you may want to show which set the user is looking at. Column header and cell render functions receive `horizontalLayoutPageIndex`, which is `null` when horizontal layout is disabled and a zero-based number when it is enabled.

That makes it easy to add a lightweight page marker in headers:

```tsx
const getColumnHeaderFor = (label: string) => {
  return ({ horizontalLayoutPageIndex }) => {
    return (
      <>
        {label}
        {horizontalLayoutPageIndex != null
          ? `(${horizontalLayoutPageIndex + 1})`
          : ''}
      </>
    );
  };
};

const columns = {
  id: {
    field: 'id',
    header: getColumnHeaderFor('ID'),
  },
  firstName: {
    field: 'firstName',
    header: getColumnHeaderFor('Name'),
  },
};
```

In a monitoring dashboard, that marker can be enough to tell users they are looking at the second or third visible slice of the same list.

<Sandpack title="Show the column set index in headers" size="md" viewMode="preview">

<Description>

Headers receive `horizontalLayoutPageIndex`, so each repeated column set can display its own label.

</Description>

```tsx live file="$DOCS/reference/horizontal-layout-with-column-set-index-in-header-example.page.tsx"

```

</Sandpack>

## Keep grouping context visible

Wrapping rows horizontally becomes more interesting when the data is grouped. Without repeated context, a group can start in one column set and its children can continue in the next set, leaving users to infer which group they are scanning.

That is what <PropLink name="repeatWrappedGroupRows" /> is for.

When <PropLink name="wrapRowsHorizontally" /> is enabled, Infinite Table repeats wrapped group rows by default. You can override that behavior with a boolean or a function:

```tsx
<InfiniteTable<Developer>
  columns={columns}
  wrapRowsHorizontally
  repeatWrappedGroupRows={(rowInfo) => {
    return rowInfo.isGroupRow && rowInfo.groupNesting === 1;
  }}
/>
```

Use `true` when every repeated parent should stay visible. Use a function when the grid has deep grouping and you only want to repeat the highest-value context rows.

<Sandpack title="Horizontal layout with repeated group rows" size="md" viewMode="preview">

<Description>

The grid is grouped by country and city. Toggle repeated wrapped group rows to see how group context is preserved across column sets.

</Description>

```tsx live file="$DOCS/reference/horizontal-layout-repeat-wrapped-groups-example.page.tsx"

```

</Sandpack>

For dense operational views, this is the difference between "a packed list" and "a packed list people can still read."

## It works for TreeGrid too

Tree data has the same context problem as grouped rows. A parent folder can start in one set while its children continue in the next.

The TreeGrid docs show the same horizontal layout model with `<TreeDataSource />` and `<TreeGrid />`:

```tsx
<TreeDataSource nodesKey="children" primaryKey="id" data={dataSource}>
  <TreeGrid
    columns={columns}
    wrapRowsHorizontally
    repeatWrappedGroupRows={(rowInfo) => {
      if (!rowInfo.isTreeNode) {
        return false;
      }

      return rowInfo.treeNesting === 0;
    }}
  />
</TreeDataSource>
```

That example repeats only top-level tree nodes when wrapping happens. Lower-level folders do not get duplicated at every set boundary, keeping the layout compact while still making the top-level section clear.

<Sandpack title="TreeGrid with horizontal layout" size="md" viewMode="preview">

<Description>

Parent tree nodes can be repeated conditionally when rows wrap horizontally.

</Description>

```tsx live file="$DOCS/reference/horizontal-layout-repeat-wrapped-tree-rows-example.page.tsx"

```

</Sandpack>

This can fit file explorers, permission editors, document libraries, and product catalogs where hierarchy matters but vertical space is limited.

## When to use horizontal layout

Reach for horizontal layout when:

- the row shape is small and repeated columns are easy to scan
- the container is wide but not very tall
- users compare many lightweight records at once
- grouped or tree context should remain visible while rows wrap
- a DataGrid still makes more sense than a custom card layout

Keep the normal layout when rows contain many fields, columns need flexible widths, or users mostly work with one long vertical list.

Horizontal layout is not a replacement for grouping, pivoting, or tree data. It is a layout option that composes with those features when the screen shape calls for it.

## Go deeper in the docs

- <PropLink name="wrapRowsHorizontally" /> - enable horizontal layout and learn how column sets are calculated
- <PropLink name="repeatWrappedGroupRows" /> - repeat grouped or tree parent rows when wrapping crosses a set boundary
- [TreeGrid overview](/docs/learn/tree-grid/overview#working-with-horizontal-layout) - use horizontal layout with tree data
- [Infinite Table props reference](/docs/reference/infinite-table-props) - complete examples for horizontal layout
