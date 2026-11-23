---
title: Horizontal layout for React DataGrids
description: Use Infinite Table's horizontal layout to wrap rows into repeated column sets, keep grouped and tree rows readable, and make dense dashboards easier to scan.
date: 2026-07-28
author: radu
tags: layout, performance, dashboards
---

Most DataGrids grow in one direction: more rows mean more vertical scrolling, and more columns mean more horizontal scrolling.

That is usually right for record-heavy workflows, but it is not always the best use of screen space. Some dashboards have a small number of columns and many compact rows. Some operations screens need a "wallboard" view where users scan multiple row segments at once. Some tree or grouped views become easier to compare when the next batch of rows appears beside the first one, not below it.

Infinite Table has a documented feature for that shape: [horizontal layout](/docs/reference/infinite-table-props#wrapRowsHorizontally), powered by <PropLink name="wrapRowsHorizontally" />.

## What horizontal layout changes

When horizontal layout is disabled, the grid renders one vertical list of rows. When <PropLink name="wrapRowsHorizontally" /> is enabled, Infinite Table wraps rows into multiple side-by-side column sets.

If three columns are visible and ten rows fit vertically, a 25-row dataset can render as:

- column set 1: rows 1-10
- column set 2: rows 11-20
- column set 3: rows 21-25

Each column set repeats the same columns. Users still read rows top to bottom inside a set, but the next page of rows starts to the right.

```tsx
<DataSource<Developer> primaryKey="id" data={dataSource}>
  <InfiniteTable<Developer>
    columns={columns}
    columnDefaultWidth={100}
    wrapRowsHorizontally
  />
</DataSource>
```

That is a different layout contract from a normal grid, so it works best when every row can be understood from a small, fixed set of columns.

## Try it in the docs demo

The API docs include a compact example with a button that toggles horizontal layout. Enable it and resize the preview to see the grid create repeated column sets as vertical space runs out.

<Sandpack title="Horizontal layout for compact row lists" size="md" viewMode="preview">

<Description>

Toggle horizontal layout to see the same `id`, `firstName`, and `age` columns repeated across wrapped row sections. Full docs: [wrapRowsHorizontally](/docs/reference/infinite-table-props#wrapRowsHorizontally).

</Description>

```tsx live file="$DOCS/reference/horizontal-layout-example.page.tsx"

```

</Sandpack>

This is useful when the grid is closer to a status board than a spreadsheet:

- call-center queues with id, owner, and status
- warehouse picking lists with SKU, aisle, and quantity
- monitoring views with service, region, and health
- approval queues with requester, amount, and age
- incident triage boards with priority, service, and assignee

In those cases, showing more rows at once can matter more than preserving a single vertical stream.

## Label repeated column sets

Because the same columns repeat, it can be useful to show the column-set index in the header. Column header render functions receive `horizontalLayoutPageIndex`, which is `null` in normal layout and a zero-based number when horizontal layout is active.

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

The result is subtle but helpful: the user can tell whether they are reading the first, second, or third wrapped segment without losing the familiar column labels.

<Sandpack title="Show the column-set index in headers" size="md" viewMode="preview">

<Description>

Headers receive `horizontalLayoutPageIndex`, so each repeated column set can render a slightly different label.

</Description>

```tsx live file="$DOCS/reference/horizontal-layout-with-column-set-index-in-header-example.page.tsx"

```

</Sandpack>

You can use the same value in cell rendering when a wrapped segment needs different styling, separators, or helper text.

## Keep grouped rows readable

Horizontal layout becomes more interesting when the `DataSource` is grouped. A group can start in one column set and continue into the next. If the group header only appears once, the rows in the next set lose context.

That is what <PropLink name="repeatWrappedGroupRows" /> is for. When enabled with <PropLink name="wrapRowsHorizontally" />, Infinite Table repeats group rows at the top of a wrapped column set when the group started in a previous set.

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

The repeated group row acts like a sticky label for the wrapped page: users know which country or city they are still scanning.

<Sandpack title="Repeat wrapped group rows" size="md" viewMode="preview">

<Description>

Turn on repeated group rows to keep grouped sections readable as rows wrap into the next column set.

</Description>

```tsx live file="$DOCS/reference/horizontal-layout-repeat-wrapped-groups-example.page.tsx"

```

</Sandpack>

For tree data, <PropLink name="repeatWrappedGroupRows" /> can also be a function. That lets you repeat only the parent levels that carry useful context.

```tsx
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
```

In a file-browser view, for example, repeating only top-level folders can keep each wrapped section understandable without duplicating every nested parent.

## Design rules for horizontal layout

Horizontal layout is intentionally advanced. It is a good fit when the content is dense, rows are compact, and users benefit from seeing more of the dataset at once.

Use it when:

- the row height is predictable
- each row needs only a few columns
- users scan rows more than they compare many fields across one row
- the container is wide enough for multiple column sets
- grouping or tree context can be repeated clearly

Avoid it when:

- columns use flexible widths, because horizontal layout expects fixed column sizing
- each row has many fields that users compare left to right
- the primary workflow depends on a single uninterrupted row order
- the repeated headers would create more visual noise than context

For traditional spreadsheet-style data entry, the normal vertical layout is usually the better default. For wallboards, operations dashboards, and dense monitoring surfaces, horizontal layout can make the same data feel much more readable.

## Go deeper in the docs

- [wrapRowsHorizontally](/docs/reference/infinite-table-props#wrapRowsHorizontally) - enable horizontal layout and understand column sets
- [repeatWrappedGroupRows](/docs/reference/infinite-table-props#repeatWrappedGroupRows) - keep grouped and tree rows readable when wrapping
- [TreeGrid with horizontal layout](/docs/learn/tree-grid/overview#working-with-horizontal-layout) - use wrapping with hierarchical data
- [Fixed and flexible column sizes](/docs/learn/columns/fixed-and-flexible-size) - choose sizing rules that work with your layout
