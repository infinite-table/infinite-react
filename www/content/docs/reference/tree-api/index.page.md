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

</PropTable>
