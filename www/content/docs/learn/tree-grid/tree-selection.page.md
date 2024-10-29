---
title: Using tree selection
description: Learn how to leverage the tree and specify the tree selection state
---

When using a tree grid, a common use-case is to allow users to select nodes, both parent and child nodes.

The `<TreeDataSource>` component allows you to specify an initial tree selection, via the `defaultTreeSelection` prop.

<Note>

When using <DPropLink name="defaultTreeSelection" /> or its controlled counterpart <DPropLink name="treeSelection" />, if no <DPropLink name="selectionMode" /> is specified, the selection mode will default to `"multi-row"`.

</Note>

<Note>

If you enable selection, don't forget to specify which column should render a selection checkbox, by using <PropLink name="columns.renderSelectionCheckBox">renderSelectionCheckBox=true</PropLink>.

</Note>

```tsx title="Example of tree selection value with default selection set to false"
import type { TreeSelectionValue } from '@infinite-table/infinite-react';

// Default selection is false, with some selected node paths: ['1'] and ['2', '20']
// however, node ['1', '10'] is deselected
const treeSelectioDefaultDeselected: TreeSelectionValue = {
  defaultSelection: false,
  selectedPaths: [['1'], ['2', '20']],
  deselectedPaths: [['1', '10']],
};

```

```tsx title="Example of tree selection value with default selection set to true"
// Default selection is true, with some deselected node paths: ['2'] and ['3']
// however, inside ['3'], we have a selected node ['3','30','301']
const treeSelectionDefaultSelected: TreeSelectionValue = {
  defaultSelection: true,
  deselectedPaths: [['2'], ['3']],
  selectedPaths: [['3','30','301']],
};
```

<Sandpack title="Using default tree selection" size="lg">

```tsx file="tree-default-selection-example.page.tsx"
```

</Sandpack>


When using <DPropLink name="defaultTreeSelection" code={false}>uncontrolled tree selection</DPropLink>, the `<TreeDataSource />` will manage the selection state internally, and will update it as a result of user actions. If you want to change the selection, you can use [the Tree API](/docs/reference/tree-api) to do so: <TreeApiLink name="selectNode"  />, <TreeApiLink name="deselectNode" />, <TreeApiLink name="selectAll" />, <TreeApiLink name="deselectAll" />, etc.

## Reacting to user actions

To listen to selection changes, you can use the <DPropLink name="onTreeSelectionChange" /> callback.

This callback is called both when the user interacts with the grid, and when you use the [Tree API](/docs/reference/tree-api) to change the selection.


## Using controlled tree selection

When using the controlled <DPropLink name="treeSelection" /> prop, you have to make sure you update the tree selection via <DPropLink name="onTreeSelectionChange" />.

Controlled tree selection also gives you a more declarative way to manage the selection state.
You no longer have to call [Tree API](/docs/reference/tree-api) methods to change the selection. Simply pass a new tree selection state object to the <DPropLink name="treeSelection" /> prop and the tree grid will be updated accordingly.

For example, if you want to select all nodes, set the <DPropLink name="treeSelection" /> prop to:

```tsx title="Tree selection value to show all nodes as selected"
{
  defaultSelection: true,
  deselectedPaths: [],
}
```

For deselecting all nodes, the value should be:

```tsx title="All nodes as deselected"
{
  defaultSelection: false,
  selectedPaths: [],
}
```

Using controlled tree selection also gives you an easy way to restore a previously saved tree selection at any point in time.

<Sandpack title="Using controlled tree selection" size="lg">

```tsx file="tree-controlled-selection-example.page.tsx"
```

</Sandpack>

