---
title: Build file explorer style React DataGrids with TreeGrid
description: Use Infinite Table TreeGrid and TreeDataSource to render nested data with expand state, selection, and custom tree icons.
date: 2026-07-13
author: radu
tags: tree-grid, tree-data, react-datagrid
---

Not every dataset is flat. Product catalogs have categories, file managers have folders, teams have reporting lines, and permissions screens often need to show resources nested under resources.

Infinite Table's [TreeGrid docs](/docs/learn/tree-grid/overview) cover this shape of data with two dedicated components: `<TreeDataSource />` and `<TreeGrid />`. They give tree data its own types and state model while keeping the same column, styling, sizing, and virtualization patterns you already use in the regular DataGrid.

## Start with nested data

For tree data, use `<TreeDataSource />` instead of `<DataSource />`, and `<TreeGrid />` instead of `<InfiniteTable />`.

```tsx {1,2}
<TreeDataSource nodesKey="children" primaryKey="id" data={dataSource}>
  <TreeGrid columns={columns} />
</TreeDataSource>
```

The `nodesKey` prop tells the data source where child nodes live on each data item. In the docs, the examples use a file-system shape where folders contain a `children` array and files are leaf nodes.

```tsx {6,12}
const dataSource = [
  {
    id: '1',
    name: 'Documents',
    type: 'folder',
    children: [
      {
        id: '10',
        name: 'Report.docx',
        type: 'file',
      },
    ],
  },
];
```

Once the data has a nested structure, choose the column that should render the expand/collapse affordance by setting <PropLink name="columns.renderTreeIcon" />.

```tsx {3}
const columns = {
  name: {
    field: 'name',
    renderTreeIcon: true,
  },
};
```

That is enough to get an interactive tree grid.

<Sandpack title="Basic TreeGrid example" size="lg" viewMode="preview">

<Description>

This example is reused from the TreeGrid docs. Expand and collapse folders to inspect the nested file-system data.

</Description>

```tsx live file="$DOCS/learn/tree-grid/basic-tree-grid-example.page.tsx"

```

</Sandpack>

## Treat nodes by path, not only by id

The TreeGrid docs use the term `node` for a rendered item in the tree, and `node path` for the route from the root node to the current node.

```tsx title="Node path example"
const data = [
  {
    id: '1', // path: ['1']
    name: 'Documents',
    children: [
      {
        id: '10', // path: ['1', '10']
        name: 'Private',
        children: [
          {
            id: '100', // path: ['1', '10', '100']
            name: 'Report.docx',
          },
        ],
      },
    ],
  },
];
```

Paths are important because tree UIs often need to preserve state at a specific location in the hierarchy. The same node id could be meaningful in different branches, while a node path describes the exact branch the user interacted with.

## Restore expand and collapse state

By default, the TreeGrid renders all nodes expanded. For product UIs, you will often want a more intentional starting point: expand the current project, collapse archived folders, or restore the state a user saved in a previous session.

Use <DPropLink name="defaultTreeExpandState" /> for an initial uncontrolled value:

```tsx
const defaultTreeExpandState = {
  defaultExpanded: true,
  collapsedPaths: [
    ['1', '10'],
    ['3', '31'],
  ],
  expandedPaths: [['3']],
};

<TreeDataSource defaultTreeExpandState={defaultTreeExpandState} />;
```

For fully controlled state, use <DPropLink name="treeExpandState" /> together with <DPropLink name="onTreeExpandStateChange" />. The same docs page also shows the imperative Tree API methods such as <TreeApiLink name="expandAll" /> and <TreeApiLink name="collapseAll" />.

<Sandpack title="Tree expand and collapse state" size="lg" viewMode="preview">

<Description>

This demo starts with a custom expand state and exposes buttons that call the Tree API to expand or collapse all nodes.

</Description>

```tsx live file="$DOCS/learn/tree-grid/tree-default-expand-collapse-example.page.tsx"

```

</Sandpack>

## Add tree-aware selection

Selection works at the tree level too. Configure <DPropLink name="defaultTreeSelection" /> or <DPropLink name="treeSelection" /> on `<TreeDataSource />`, and render a checkbox in the tree column with <PropLink name="columns.renderSelectionCheckBox" />.

```tsx {2,7}
const defaultTreeSelection = {
  defaultSelection: true,
  deselectedPaths: [
    ['1', '10'],
    ['3', '31'],
  ],
  selectedPaths: [['3']],
};

const columns = {
  name: {
    field: 'name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
  },
};
```

This include/exclude shape scales well for large trees because you can describe "everything is selected except these branches" or "nothing is selected except these branches" without enumerating every leaf node.

<Sandpack title="Tree selection with checkboxes" size="lg" viewMode="preview">

<Description>

Select and deselect branches, then use the buttons above the grid to call the Tree API for all nodes.

</Description>

```tsx live file="$DOCS/learn/tree-grid/tree-default-selection-example.page.tsx"

```

</Sandpack>

## Customize the tree icon

The default expand/collapse icon is enough for many apps, but file explorers, permission editors, and navigation builders usually need stronger visual signals.

The [tree icon docs](/docs/learn/tree-grid/tree-icon-rendering) show two useful levels of customization:

- set `--infinite-expand-collapse-icon-color` to recolor the default icon
- provide a function to <PropLink name="columns.renderTreeIcon" /> when you want custom icons for both parent and leaf nodes

When `renderTreeIcon` is a function, it receives tree-specific row information. Check `rowInfo.isParentNode` before reading parent-only state such as `rowInfo.nodeExpanded`.

```tsx title="Rendering a custom tree icon"
const renderTreeIcon = ({ rowInfo, toggleCurrentTreeNode }) => {
  if (!rowInfo.isParentNode) {
    return <FileIcon />;
  }

  return (
    <FolderIcon open={rowInfo.nodeExpanded} onClick={toggleCurrentTreeNode} />
  );
};
```

## When to reach for TreeGrid

Use TreeGrid when the hierarchy is part of the data model:

- file-system or document-library UIs
- organization charts and team member lists
- product catalogs with nested categories
- permission editors with resources and sub-resources
- project plans with parent tasks and child tasks

Use regular row grouping when the hierarchy is derived from flat data. Use TreeGrid when the hierarchy already exists in the records you load.

Start with the [TreeGrid overview](/docs/learn/tree-grid/overview), then continue with [expand/collapse state](/docs/learn/tree-grid/tree-expand-and-collapse-state), [tree selection](/docs/learn/tree-grid/tree-selection), and [custom tree icons](/docs/learn/tree-grid/tree-icon-rendering) depending on the interaction your app needs.
