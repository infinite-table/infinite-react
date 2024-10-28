---
title: Managing the tree column and expand/collapse icon
description: Learn how to render the tree expand/collapse icon and manage the tree column
---

When rendering a tree, you have to use the `<TreeGrid />` component instead of `<InfiniteTable />`.

The `<TreeGrid />` component is simply an `<InfiniteTable />` component with some props removed - those don't make sense for tree scenarios.


<Note>

By default no tree column is rendered.

To specify the tree column, you have to to set the <PropLink name="columns.renderTreeIcon" /> prop to `true` for your column of choice.

</Note>

```tsx {3} title="Specifying the tree column"
const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: { 
    renderTreeIcon: true,
    field: 'name',
    header: 'Name' 
  },
  type: { field: 'type', header: 'Type' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
};
```
This is very similar to how you specify the [selection column for multi-select configurations](/docs/learn/selection/row-selection#using-a-selection-checkbox).

<Sandpack title="Specifying the tree column">

```tsx file="$DOCS/reference/treegrid-rendericon-default-example.page.tsx"

```
</Sandpack>

## Customizing the expand/collapse icon

Using the <PropLink name="columns.renderTreeIcon">column.renderTreeIcon=true</PropLink> is obviously not enough to customize the expand/collapse icon.

This prop can also be a function that returns a React node.

<Note>

With the default value of `true` for <PropLink name="columns.renderTreeIcon" />, an icon will be rendered only for parent nodes.

If you want to render an icon for all nodes, specify a function (and differentiate between parent and leaf nodes), and it will be called regardless of whether the node is a parent or a leaf.

</Note>

<Sandpack title="Customizing the expand/collapse icon">

```tsx file="tree-custom-renderTreeIcon-example.page.tsx"

```

</Sandpack>



