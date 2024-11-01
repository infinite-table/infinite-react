---
title: Using & rendering tree icons
description: Learn how to customize the tree icons
---


To make a column render the tree icon, you have to set <PropLink name="columns.renderTreeIcon" /> to `true`. This will cause the default tree icon to be rendered for non-leaf nodes.

```tsx {4} title="Specifying the tree icon for a column"
const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: {
    field: 'name',
    renderTreeIcon: true,
  },
  type: { field: 'type' },
  extension: { field: 'extension' },
  size: { field: 'sizeInKB', type: 'number' },
};
```

<Note>

If you don't have <PropLink name="columns.renderTreeIcon" /> set, there will be no tree column to render the tree icon.

</Note>

<Sandpack title="Tree icon rendering" >

```tsx file="tree-icon-default-example.page.tsx"
```

</Sandpack>


## Customizing the tree icon

There are multiple ways to customize the tree icon.

First, you can very easily change the color of the icon. The color of the icon is controlled by the `--infinite-expand-collapse-icon-color` CSS variable, and defaults to  `--infinite-accent-color`, but you can also set it to any other color you want.

```css title="Changing the color of the tree icon"
.Infinite {
  --infinite-expand-collapse-icon-color: #6f6f6f;
}
```

<Sandpack title="Customizing the tree icon color" >

```tsx file="tree-icon-custom-color-example.page.tsx"
```

</Sandpack>

If you want to go further, use a function for the `column.renderTreeIcon` property - the next section will go into more detail on this.

## Rendering a custom tree icon for both parent and leaf nodes

When <PropLink name="columns.renderTreeIcon" /> is `true`, the tree icon will be rendered only for parent nodes.

<Note>

In your implementation of the `renderTreeIcon` function, you'll use the `rowInfo.nodeExpanded` property.

Note that the property is only available for parent nodes, so you'll first have to use the `rowInfo.isParentNode` property as a TS discriminator to check if the node is a parent node.

```tsx title="Checking if the node is a parent node"
const renderTreeIcon = ({ rowInfo }) => {
  if (!rowInfo.isParentNode) {
    // rowInfo.nodeExpanded not available here
    return <FileIcon />;
  }
  
  // it's now OK for TS to use rowInfo.nodeExpanded
  return  <FolderIcon open={rowInfo.nodeExpanded} onClick={toggleCurrentTreeNode} />
};
```
</Note>

However when you specify a function, it will be called for both parent and leaf nodes (if you don't want an icon for leaf nodes, simply return `null`).

This gives you maximum flexibility to icons. A common example is a file explorer, where you might want to render icons not only for folders, but also for files.

<Sandpack title="Rendering a custom tree icon for both parent and leaf nodes" >

<Description>

This example renders a custom tree icon and uses the `toggleCurrentTreeNode` function to toggle the node state when Clicked. `toggleCurrentTreeNode` is a property of the argument passed to the `renderTreeIcon` function.

</Description>

```tsx file="tree-icon-custom-example.page.tsx"
```

</Sandpack>


<Note>

If you implement a custom <PropLink name="columns.renderTreeIcon" /> function for your column, you can still use the default tree icon.

Use `renderBag.treeIcon` property in the JSX you return (the `renderBag` is available as a property of the `cellContext` argument of the `renderTreeIcon` function).

</Note>
