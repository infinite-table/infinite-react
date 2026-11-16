---
title: Tree API
layout: API
---

When rendering the `TreeDataSource` component, you can get access to the Tree API by reading it from the [DataSource API](/docs/reference/datasource-api) <DApiLink name="treeApi" /> property.

```tsx file="index.snippet.tsx" region="intro"
```

For updating tree nodes, see the following methods:

- <DApiLink name="updateDataByNodePath" />
- <DApiLink name="removeDataByNodePath" />

<PropTable sort searchPlaceholder="Type to filter API methods">

<Prop name="expandAll" type="() => void">

> Expands all the nodes in the tree. See related <TreeApiLink name="collapseAll" /> prop.

```tsx file="tree-expandall-example.demo.tsx" title="Expanding all nodes" height="large"
```

</Prop>

<Prop name="selectAll" type="() => void">

> Selects all the nodes in the tree. See related <TreeApiLink name="deselectAll" /> prop.

This works if the tree has selection enabled. See [tree selection](/docs/learn/tree-grid/tree-selection) for more details.

When some nodes are filtered out, <DPropLink name="multiRowSelectionTarget" /> decides which nodes are selected: all of them (`'all'`, the default), or only the nodes that pass the filter (`'visible'`).

```tsx file="tree-selectall-example.demo.tsx" title="Selecting all nodes via Tree API" height="large"
```

</Prop>

<Prop name="selectNode" type="(nodePath: NodePath) => void">

> Selects the node with the given node path. See related <TreeApiLink name="deselectNode" /> and <TreeApiLink name="toggleNodeSelection" /> methods.


```tsx file="tree-selectnode-example.demo.tsx" title="Selecting a node via Tree API" height="large"
```

</Prop>

<Prop name="deselectNode" type="(nodePath: NodePath) => void">

> Deselects the node with the given node path. See related <TreeApiLink name="selectNode" /> and <TreeApiLink name="toggleNodeSelection" /> methods.

```tsx file="tree-selectnode-example.demo.tsx" title="Deselecting a node via Tree API" height="large"
```

</Prop>


<Prop name="toggleNodeSelection" type="(nodePath: NodePath) => void">

> Toggles the selection state of the node with the given node path. See related <TreeApiLink name="selectNode" /> and <TreeApiLink name="deselectNode" /> methods.

```tsx file="tree-selectnode-example.demo.tsx" title="Toggling a node's selection state via Tree API" height="large"
```

</Prop>

<Prop name="deselectAll" type="() => void">

> Deselects all the nodes in the tree. See related <TreeApiLink name="selectAll" /> prop.

When some nodes are filtered out and <DPropLink name="multiRowSelectionTarget" /> is `'visible'`, only the nodes that pass the filter are deselected.

This works if the tree has selection enabled. See [tree selection](/docs/learn/tree-grid/tree-selection) for more details.

```tsx file="tree-selectall-example.demo.tsx" title="Deselecting all nodes via Tree API" height="large"
```

</Prop>

<Prop name="collapseAll" type="() => void">

> Collapses all the nodes in the tree. See related <TreeApiLink name="expandAll" /> prop.

```tsx file="tree-expandall-example.demo.tsx" title="Collapsing all nodes" height="large"
```

</Prop>


<Prop name="isNodeExpanded" type="(nodePath: NodePath) => boolean">

> Returns `true` if the node is expanded, `false` otherwise.

```tsx file="tree-toggleNodeExpandState-example.demo.tsx" title="Checking if a node is expanded" height="large"
```

</Prop>

<Prop name="toggleNode" type="(nodePath: NodePath, options?: {force?: boolean}) => void">

> Toggles the node with the give node path.

If the node at the given path is expanded, it will be collapsed and vice versa.

See related <TreeApiLink name="expandNode" /> and <TreeApiLink name="collapseNode" /> methods.

</Prop>

<Prop name="expandNode" type="(nodePath: NodePath, options?: {force?: boolean}) => void">

> Expands the node with the given node path. See related <TreeApiLink name="collapseNode" /> and <TreeApiLink name="toggleNode" /> methods.

Expands the node. Does not affect other child nodes.

```tsx file="tree-toggleNodeExpandState-example.demo.tsx" title="Expanding a node" height="large"
```

<Note>

If `options.force` is `true`, the node will be expanded even if <DPropLink name="isNodeReadOnly" /> is `true` for the given node.

</Note>
</Prop>

<Prop name="collapseNode" type="(nodePath: NodePath, options?: {force?: boolean}) => void">

> Collapses the node with the given node path. See related <TreeApiLink name="expandNode" /> and <TreeApiLink name="toggleNode" /> methods.

Collapses the node. Does not affect other child nodes.

```tsx file="tree-toggleNodeExpandState-example.demo.tsx" title="Collapsing a node" height="large"
```

<Note>

If `options.force` is `true`, the node will be collapsed even if <DPropLink name="isNodeReadOnly" /> is `true` for the given node.

</Note>
</Prop>

</PropTable>
