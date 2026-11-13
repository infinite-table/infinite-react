---
title: Using Tree Data in your React DataGrid
description: Learn how to use the React Tree DataGrid to display tree data
---


Starting with version `6.0.0`, Infinite Table has support for displaying tree data.

<Note>

To show tree data, you have to use:
 - the `<TreeDataSource />` instead of `<DataSource />` component 
 - the `<TreeGrid />` instead of `<InfiniteTable />` component.

Under the hood, those specialized components have better typing support for tree data, which will make it easier to work with them.
</Note>

<Note>

To specify which column will have the expand/collapse icon, set the <PropLink name="columns.renderTreeIcon" /> prop to `true` for that column.

</Note>


```tsx file="basic-tree-grid-example.demo.tsx" title="Basic TreeGrid example" height="large"
```

Throughout the docs for the TreeGrid, we will use an example data source that illustrates file system data, as that will be familiar to most people.

## Terminology


When referring to rows in the TreeGrid, we'll prefer to use the term `"node"` instead of "row". So whenever you see `"node"` in the docs, you should know that it refers to a TreeGrid configuration of Infinite Table.

Also in the context of the TreeGrid, we'll use the term `"node path"` instead of row id. The `"node path"` is the array with the ids of all the parent nodes leading down to the current node. The node path includes the id of the current node.

```tsx file="overview.snippet.tsx" region="node-path-vs-row-id" title="Node path vs row id"
```
It's important to understand node paths, as that will be the primary way you'll interact with the TreeGrid/TreeDataSource.

<Note>

For the initial version of the TreeGrid, it's safer if your node ids are unique globally, but as we refine the TreeGrid, it will be safe to use ids unique only within a node children (so unique relative to siblings).

</Note>

### Parent vs leaf nodes

Nodes with an array for their `nodesKey` property (defaults to `"children"`) are considered parent nodes. All other nodes are leaf nodes.

When using the <TypeLink name="InfiniteTableRowInfo" /> type, you can check for `isTreeNode` to determine if you're in a tree scenario. Also use the `isParentNode` property to check if a node is a parent node or not.

## Data format for the TreeDataSource

When using the `<TreeDataSource />` component, the data you specify in your `<DPropLink name="dataSource" />` should resolve to a nested array - with the `nodesKey` containing the child items for each tree node.

```tsx file="overview.snippet.tsx" region="using-the-nodeskey-prop-to-specify-where-the" title="Using the nodesKey prop to specify where the node children are"
```

With the `nodesKey` set to `"children"`, the `<TreeDataSource />` will look for the `children` property on each item in the data array, and use that to determine the child nodes for each tree node. Nodes without a `"children"` property are assumed to be leaf nodes.

```tsx file="overview.snippet.tsx" region="nested-data-structure-for-the-treedatasource" title="Nested data structure for the TreeDataSource component"
```


## Tree collapse and expand state

The `<TreeDataSource />` component allows you to fully configure & control the collapse and expand state of the tree nodes, via the <DPropLink name="treeExpandState" />/<DPropLink name="defaultTreeExpandState" /> props.

By default, if no expand state is specified, the tree will be rendered as fully expanded.

However, you can choose to specify the expand state with a default value and then with specific values for node paths (or node ids)

```tsx file="/docs/reference/datasource-props/tree-controlled-expandstate-example.demo.tsx" title="Using controlled tree expand state" height="large"
```


When using node paths for <DPropLink name="treeExpandState" />, the object should have the following properties:

- `defaultExpanded`: `boolean` - whether the tree nodes are expanded by default or not.
- `collapsedPaths`: `string[]` - when `defaultExpanded` is `true`, this is a mandatory prop.
- `expandedPaths`: `string[]` - when `defaultExpanded` is `false`, this is a mandatory prop.

```tsx file="overview.snippet.tsx" region="example-of-treeexpandstate-with-node-paths" title="Example of treeExpandState with node paths"
```

<Note>

As seen above, you can have a node specifically collapsed while other child nodes specifically expanded.
So you can combine the expanded/collapsed paths to achieve very complex tree layouts, which can be restored later.

</Note>

## Working with horizontal layout

The <PropLink name="wrapRowsHorizontally" /> prop can be used to enable horizontal layout, just like non-tree DataGrids.

```tsx file="tree-grid-horizontal-layout-example.demo.tsx" title="TreeGrid with horizontal layout"
```
