---
title: Managing the tree expand/collapse state
description: Learn how to control which tree nodes are expanded or collapsed
---

By default, the tree will be rendered with all nodes expanded. This is fine for basic use cases, but as soon as you go into more complex scenarios, you will want to control which nodes are expanded or collapsed.

This is easy to achieve via the <DPropLink name="defaultTreeExpandState" /> prop. This is an uncontrolled prop and allows you to initially specify the expand/collapse state of the tree - all subsequent user updates will result in the tree state being updated to match the UI actions.

<Sandpack title="Specifying an initial tree expand state" size="lg">

```tsx file="tree-default-expand-collapse-example.page.tsx"
```

</Sandpack>

## Understanding the tree expand state


You can specify the expand/collapse state of the tree in two ways:

1. With node paths (recommended)

When using node paths, the object should have the following properties:

- `defaultExpanded`: `boolean` - whether the tree nodes are expanded by default or not.
- `collapsedPaths`: `string[]` - when `defaultExpanded` is `true`, this is a mandatory prop.
- `expandedPaths`: `string[]` - when `defaultExpanded` is `false`, this is a mandatory prop.

```tsx title="Example of treeExpandState with node paths"
const treeExpandState = {
  defaultExpanded: true,
  collapsedPaths: [
    ['1', '10'],
    ['2', '20'],
    ['5']
  ],
  expandedPaths: [
    ['1', '4'],
    ['5','nested node in 5'],
  ],
};
```

2. With node ids

When using node ids, the object should have the following properties:

- `defaultExpanded`: `boolean` - whether the tree nodes are expanded by default or not.
- `collapsedIds`: `string[]` - when `defaultExpanded` is `true`, this is a mandatory prop.
- `expandedIds`: `string[]` - when `defaultExpanded` is `false`, this is a mandatory prop.


```tsx title="Example of treeExpandState with node ids"
const treeExpandState = {
  defaultExpanded: true,
  collapsedIds: ['1', '2', '5'],
  expandedIds: ['10', '20', 'nested node in 5'],
};
```

## Reacting to user actions

You can listen to the user interactions with the tree by using the <DPropLink name="onTreeExpandStateChange">{`onTreeExpandStateChange(treeExpandState, {dataSourceApi, nodePath, nodeState})`}</DPropLink> callback. This callback is called with the new tree state whenever the user expands or collapses a node.

In addition to this callback, you can also use the following:

 - <DPropLink name="onNodeExpand">{`onNodeExpand(nodePath, {dataSourceApi})`}</DPropLink>
 - <DPropLink name="onNodeCollapse">{`onNodeCollapse(nodePath, {dataSourceApi})`}</DPropLink>

<Note>

The <DPropLink name="onNodeExpand" /> and <DPropLink name="onNodeCollapse" /> callbacks are called when a node is expanded or collapsed, respectively - either via user interaction or by an API call. However, they will not be called when the <TreeApiLink name="expandAll" /> or <TreeApiLink name="collapseAll" /> methods are called.

</Note>


## Using controlled expand/collapse state

If you want maximum control over the collapse/expand state, you should use the controlled <DPropLink name="treeExpandState" /> prop.

This will allow you to own the collapse/expand state entirely - but make sure you use the <DPropLink name="onTreeExpandStateChange" /> callback to react to user actions or API calls being made to update the tree state.

<Sandpack title="Using controlled expand/collapse state" size="lg">

```tsx file="$DOCS/reference/datasource-props/tree-controlled-expandstate-example.page.tsx"
```
</Sandpack>

<Note>

When using controlled <DPropLink name="treeExpandState" />, you no longer need to use API calls.

When you need to expand all nodes, simply set the <DPropLink name="treeExpandState" /> to `{defaultExpanded: true, collapsedPaths: []}`.

When you need to collapse all nodes, simply set the <DPropLink name="treeExpandState" /> to `{defaultExpanded: false, expandedPaths: []}`.

</Note>
