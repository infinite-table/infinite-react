---
title: Using Tree Data
description: Learn how to use the Tree DataGrid to display tree data
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


<Sandpack title="Basic TreeGrid example" size="lg">

```tsx file="basic-tree-grid-example.page.tsx"
```

</Sandpack>

Throughout the docs for the TreeGrid, we will use an example data source that illustrates file system data, as that will be familiar to most people.

## Terminology


When referring to rows in the TreeGrid, we'll prefer to use the term `"node"` instead of "row". So whenever you see `"node"` in the docs, you should know that it refers to a TreeGrid configuration of Infinite Table.

Also in the context of the TreeGrid, we'll use the term `"node path"` instead of row id. The `"node path"` is the array with the ids of all the parent nodes leading up to the current node.

```tsx {2} title="Node path vs row id"
const data = [
  { id: '1', name: 'Documents',                // path: ['1']
    children: [
      { id: '10', name: 'Private',             // path: ['1', '10']
        children: [
          { id: '100', name: 'Report.docx' },  // path: ['1', '10', '100'] 
          { id: '101', name: 'Vacation.docx' },// path: ['1', '10', '101']
        ],
      },
    ]
  },
  {
    id: '2',
    name: 'Downloads',                        // path: ['2']
    children: [
      {
        id: '20',
        name: 'cat.jpg',                      // path: ['2', '20']
      },
    ],
  },
];
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

```tsx {2} title="Using the nodesKey prop to specify where the node children are"
<TreeDataSource
  nodesKey="children"
  primaryKey="id"
  data={dataSource}
/>
```

With the `nodesKey` set to `"children"`, the `<TreeDataSource />` will look for the `children` property on each item in the data array, and use that to determine the child nodes for each tree node. Nodes without a `"children"` property are assumed to be leaf nodes.

```tsx {2} title="Nested data structure for the TreeDataSource component"
const dataSource = [
  {
    id: '1',
    name: 'Documents',
    children: [
      {
        id: '10',
        name: 'Private',
        children: [
          {
            id: '100',
            name: 'Report.docx',
          },
          {
            id: '101',
            name: 'Vacation.docx',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Downloads',
    children: [] // will be a parent node, with no children
  },
];
```


## Tree collapse and expand state

The `<TreeDataSource />` component allows you to fully configure & control the collapse and expand state of the tree nodes, via the <DPropLink name="treeExpandState" />/<DPropLink name="defaultTreeExpandState" /> props.

By default, if no expand state is specified, the tree will be rendered as fully expanded.

However, you can choose to specify the expand state with a default value and then with specific values for node paths (or node ids)

<Sandpack title="Using controlled tree expand state" size="large">

```ts file="$DOCS/reference/datasource-props/tree-controlled-expandstate-example.page.tsx"
```

</Sandpack>


When using node paths for <DPropLink name="treeExpandState" />, the object should have the following properties:

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

<Note>

As seen above, you can have a node specifically collapsed while other child nodes specifically expanded.
So you can combine the expanded/collapsed paths to achieve very complex tree layouts, which can be restored later.

</Note>

## Working with horizontal layout

The <PropLink name="wrapRowsHorizontally" /> prop can be used to enable horizontal layout, just like non-tree DataGrids.