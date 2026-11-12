---
title: Building a file explorer TreeGrid in React
description: Use Infinite Table TreeGrid and TreeDataSource to render nested data with expand state, selection, and custom tree icons.
date: 2026-07-13
author: radu
tags: tree-grid, tree-data, react-datagrid
---

An important use-case for Infinite Table is handling tree data. There's a log of scenarios where you need handling hierarchical data: product catalogs with categories, file managers, CRMs, permissions screens often need to show resources nested under resources.

Infinite Table's [TreeGrid docs](/docs/learn/tree-grid/overview) cover this shape of data with two dedicated components: `<TreeDataSource />` and `<TreeGrid />`. They give tree data its own types and state model while keeping the rest of the DataGrid the same - same columns, styling, sizing, and virtualization patterns you already use in the regular DataGrid.

## Start with nested data

For tree data, use `<TreeDataSource />` instead of `<DataSource />`, and `<TreeGrid />` instead of `<InfiniteTable />`.

```tsx file="building-a-file-explorer-treegrid-in-react.snippet.tsx" region="start-with-nested-data"
```

The `nodesKey` prop tells the data source where child nodes live on each data item. In the docs, the examples use a file-system shape where folders contain a `children` array and files are leaf nodes.

```tsx file="building-a-file-explorer-treegrid-in-react.snippet.tsx" region="start-with-nested-data-2"
```

Once the data has a nested structure, choose the column that should render the expand/collapse affordance by setting <PropLink name="columns.renderTreeIcon" />.

```tsx file="building-a-file-explorer-treegrid-in-react.snippet.tsx" region="start-with-nested-data-3"
```

With this setup, you're already good to go and have an interactive tree grid.

<DemoDescription>

This example is reused from the TreeGrid docs. Expand and collapse folders to inspect the nested file-system data.

</DemoDescription>

```tsx file="/docs/learn/tree-grid/basic-tree-grid-example.demo.tsx" title="Basic TreeGrid example"
```

## Treat nodes by path, not only by id

The TreeGrid docs use the term `node` for a rendered item/row in the tree, and `node path` for the route from the root node to the current node.

<Note>
The top-level of your `TreeDataSource` doesn't need to be only one item - you can have multiple roots that are siblings to each other.
</Note>

```tsx file="building-a-file-explorer-treegrid-in-react.snippet.tsx" region="node-path-example" title="Node path example"
```

Paths are important because tree UIs often need to preserve state at a specific location in the hierarchy. The same node id could be meaningful in different branches, while a node path describes the exact branch the user interacted with.

## Restore expand and collapse state

By default, the TreeGrid renders all nodes expanded. For product UIs, you will often want a more intentional starting point: expand the current project, collapse archived folders, or restore the state a user saved in a previous session.

Use <DPropLink name="defaultTreeExpandState" /> for an initial uncontrolled value:

```tsx file="building-a-file-explorer-treegrid-in-react.snippet.tsx" region="restore-expand-and-collapse-state"
```

For fully controlled state, use <DPropLink name="treeExpandState" /> together with <DPropLink name="onTreeExpandStateChange" />. The same docs page also shows the imperative Tree API methods such as <TreeApiLink name="expandAll" /> and <TreeApiLink name="collapseAll" />.

<DemoDescription>

This demo starts with a custom expand state and exposes buttons that call the Tree API to expand or collapse all nodes.

</DemoDescription>

```tsx file="/docs/learn/tree-grid/tree-default-expand-collapse-example.demo.tsx" height="large" title="Tree expand and collapse state"
```

## Add tree-aware selection

Selection works at the tree level too. Configure <DPropLink name="defaultTreeSelection" /> or <DPropLink name="treeSelection" /> on `<TreeDataSource />`, and render a checkbox in the tree column with <PropLink name="columns.renderSelectionCheckBox" />.

```tsx file="building-a-file-explorer-treegrid-in-react.snippet.tsx" region="add-tree-aware-selection"
```

This include/exclude shape scales well for large trees because you can describe "everything is selected except these branches" or "nothing is selected except these branches" without enumerating every leaf node.

<DemoDescription>

Select and deselect branches, then use the buttons above the grid to call the Tree API for all nodes.

</DemoDescription>

```tsx file="/docs/learn/tree-grid/tree-default-selection-example.demo.tsx" height="large" title="Tree selection with checkboxes"
```

## Customize the tree icon

The default expand/collapse icon is enough for many apps, but file explorers, permission editors, and navigation builders usually need stronger visual signals.

The [tree icon docs](/docs/learn/tree-grid/tree-icon-rendering) show two useful levels of customization:

- set `--infinite-expand-collapse-icon-color` to recolor the default icon
- provide a function to <PropLink name="columns.renderTreeIcon" /> when you want custom icons for both parent and leaf nodes

When `renderTreeIcon` is a function, it receives tree-specific row information. Check `rowInfo.isParentNode` before reading parent-only state such as `rowInfo.nodeExpanded`.

```tsx file="building-a-file-explorer-treegrid-in-react.snippet.tsx" region="rendering-a-custom-tree-icon" title="Rendering a custom tree icon"
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
