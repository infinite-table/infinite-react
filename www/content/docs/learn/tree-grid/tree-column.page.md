---
title: Managing the tree column and expand/collapse icon
description: Learn how to render the tree expand/collapse icon and manage the tree column
vue: true
angular: true
---

<FrameworkContent not="angular">

When rendering a tree, you have to use the `<TreeGrid />` component instead of `<InfiniteTable />`.

The `<TreeGrid />` component is simply an `<InfiniteTable />` component with some props removed - those don't make sense for tree scenarios.

</FrameworkContent>

<FrameworkContent framework="angular">

When rendering a tree, you have to use the `TreeGrid` component (`<infinite-tree-grid>`) instead of `InfiniteTable` (`<infinite-table>`), inside a `TreeDataSource` (`<infinite-tree-data-source>`).

The `TreeGrid` component is simply an `InfiniteTable` component with some inputs removed - those don't make sense for tree scenarios.

</FrameworkContent>


<Note>

By default no tree column is rendered.

To specify the tree column, you have to to set the <PropLink name="columns.renderTreeIcon" /> prop to `true` for your column of choice.

</Note>

```tsx file="tree-column.snippet.tsx" region="specifying-the-tree-column" title="Specifying the tree column" neutral
```
This is very similar to how you specify the [selection column for multi-select configurations](/docs/learn/selection/row-selection#using-a-selection-checkbox).

```tsx file="/docs/reference/treegrid-rendericon-default-example.demo.tsx" title="Specifying the tree column"
```

## Customizing the expand/collapse icon

Using the <PropLink name="columns.renderTreeIcon">column.renderTreeIcon=true</PropLink> is obviously not enough to customize the expand/collapse icon.

<FrameworkContent framework="react">

This prop can also be a function that returns a React node.

</FrameworkContent>

<FrameworkContent framework="vue">

This prop can also be a function that returns a VNode, created with `h()`.

</FrameworkContent>

<FrameworkContent framework="angular">

This prop can also be a function that returns a template (a `TemplateRef` of your component, read with `viewChild`), a component (`renderComponent(MyIcon)`) or a string. A template gets the arguments of the function as its context - `let-rowInfo="rowInfo"`, `let-toggleCurrentTreeNode="toggleCurrentTreeNode"`.

</FrameworkContent>

<Note>

With the default value of `true` for <PropLink name="columns.renderTreeIcon" />, an icon will be rendered only for parent nodes.

If you want to render an icon for all nodes, specify a function (and differentiate between parent and leaf nodes), and it will be called regardless of whether the node is a parent or a leaf.

</Note>

```tsx file="tree-custom-renderTreeIcon-example.demo.tsx" title="Customizing the expand/collapse icon"
```



