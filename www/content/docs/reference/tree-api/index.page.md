---
title: Tree API
layout: API
---

When rendering the `TreeDataSource` component, you can get access to the Tree API by reading it from the [DataSource API](/docs/reference/datasource-api) <DApiLink name="treeApi" /> property.

```tsx {3}
<DataSource<DATA_TYPE>
  onReady={(api: DataSourceApi<DATA_TYPE>) => {
    api.treeApi // <----
    // treeApi is accessible here
    // you may want to store a reference to it in a ref or somewhere in your app state
    
  }}
/>
```

For updating tree nodes, see the following methods:

- <DApiLink name="updateDataByNodePath" />
- <DApiLink name="removeDataByNodePath" />

<PropTable sort searchPlaceholder="Type to filter API methods">

<Prop name="expandAll" type="() => void">

> Expands all the nodes in the tree. See related <TreeApiLink name="collapseAll" /> prop.

<Sandpack title="Expanding all nodes" size="lg">

```tsx file="tree-expandall-example.page.tsx"

```

</Sandpack>

</Prop>


<Prop name="collapseAll" type="() => void">

> Collapses all the nodes in the tree. See related <TreeApiLink name="expandAll" /> prop.

<Sandpack title="Collapsing all nodes" size="lg">

```tsx file="tree-expandall-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="isNodeExpanded" type="(nodePath: NodePath) => boolean">

> Returns `true` if the node is expanded, `false` otherwise.

<Sandpack title="Checking if a node is expanded" size="lg">

```tsx file="tree-toggleNodeExpandState-example.page.tsx"
```

</Sandpack>

</Prop>

<Prop name="toggleNode" type="(nodePath: NodePath) => void">

> Toggles the node with the give node path.

If the node at the given path is expanded, it will be collapsed and vice versa.

See related <TreeApiLink name="expandNode" /> and <TreeApiLink name="collapseNode" /> methods.

</Prop>

<Prop name="expandNode" type="(nodePath: NodePath) => void">

> Expands the node with the given node path. See related <TreeApiLink name="collapseNode" /> and <TreeApiLink name="toggleNode" /> methods.

Expands the node. Does not affect other child nodes.

<Sandpack title="Expanding a node" size="lg">

```tsx file="tree-toggleNodeExpandState-example.page.tsx"
```

</Sandpack>

</Prop>

<Prop name="collapseNode" type="(nodePath: NodePath) => void">

> Collapses the node with the given node path. See related <TreeApiLink name="expandNode" /> and <TreeApiLink name="toggleNode" /> methods.

Collapses the node. Does not affect other child nodes.

<Sandpack title="Collapsing a node" size="lg">

```tsx file="tree-toggleNodeExpandState-example.page.tsx"
```

</Sandpack>

</Prop>

</PropTable>
