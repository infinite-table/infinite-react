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

```tsx file="tree-selection.snippet.tsx" region="example-of-tree-selection-value-with-default" title="Example of tree selection value with default selection set to false"
```

```tsx file="tree-selection.snippet.tsx" region="default-selection-true" title="Example of tree selection value with default selection set to true"
```

```tsx file="tree-default-selection-example.demo.tsx" title="Using default tree selection" height="large"
```


When using <DPropLink name="defaultTreeSelection" code={false}>uncontrolled tree selection</DPropLink>, the `<TreeDataSource />` will manage the selection state internally, and will update it as a result of user actions. If you want to change the selection, you can use [the Tree API](/docs/reference/tree-api) to do so: <TreeApiLink name="selectNode"  />, <TreeApiLink name="deselectNode" />, <TreeApiLink name="selectAll" />, <TreeApiLink name="deselectAll" />, etc.

## Selecting nodes with the mouse and keyboard

Users select nodes just like rows in a grouped table - see [using your mouse and keyboard to select rows](/docs/learn/selection/row-selection#using-your-mouse-and-keyboard-to-select-rows). Parent nodes work like group rows:

- clicking a node selects it, and only it - clicking a parent node selects all its nodes;
- `cmd`/`ctrl` + click toggles a node, keeping the rest of the selection;
- `shift` + click selects the range of nodes displayed from the last clicked node to the clicked one. A collapsed parent node in the range is selected with all its nodes, while an expanded one follows its children - only its nodes inside the range are selected. The starting node keeps what its own click selected, so a parent node stays selected with all its nodes;
- the spacebar works like a click on the active row, and `shift` + spacebar selects a range.

The <PropLink name="multiRowSelectionWith" /> prop decides whether clicks select nodes while a visible column shows a selection checkbox. With `'checkbox'` (the default), users select nodes with the checkboxes (`shift` + a checkbox selects a range) and the spacebar toggles the active node. With `'click'`, clicks select nodes as well.

Clicking the expand/collapse icon of a parent node doesn't change the selection, and nodes that can't be selected - like read-only parent nodes (see <DPropLink name="isNodeReadOnly" />) - are skipped.

With single-row selection, clicking a node - a parent node too - selects it, while `cmd`/`ctrl` + click and the spacebar toggle it.

<DemoDescription>

Click `Report.docx`, then `shift` + click `unknown.txt` - the collapsed `Private` folder is selected with all its files. Use the buttons to show the selection checkboxes and to choose how users select nodes.

</DemoDescription>

```tsx file="tree-click-selection-example.demo.tsx" height="large" title="Selecting nodes with the mouse and keyboard"
```

## Selecting nodes when the tree is filtered

When some nodes are filtered out (see <DPropLink name="treeFilterFunction" />), use the <DPropLink name="multiRowSelectionTarget" /> prop to decide which nodes the header checkbox, the parent node checkboxes and <TreeApiLink name="selectAll" />/<TreeApiLink name="deselectAll" /> act on:

- `'all'` (the default) - they act on all the leaf nodes, including the ones that are filtered out. A parent node checkbox is only checked when all its leaf nodes are selected.
- `'visible'` - they act only on the leaf nodes that pass the filter. Filtered out nodes keep their current selection. A parent node checkbox is checked when all its visible leaf nodes are selected.

When no nodes are filtered out, both values behave the same.

<DemoDescription>

The tree is filtered to only show `.docx` files. Select a folder or click "Select all", then clear the filter to see which files were selected with each <DPropLink name="multiRowSelectionTarget" /> value.

</DemoDescription>

```tsx file="tree-selection-target-example.demo.tsx" height="large" title="Choosing which nodes the selection acts on when the tree is filtered"
```

## Reacting to user actions

To listen to selection changes, you can use the <DPropLink name="onTreeSelectionChange" /> callback.

This callback is called both when the user interacts with the grid, and when you use the [Tree API](/docs/reference/tree-api) to change the selection.


## Using controlled tree selection

When using the controlled <DPropLink name="treeSelection" /> prop, you have to make sure you update the tree selection via <DPropLink name="onTreeSelectionChange" />.

Controlled tree selection also gives you a more declarative way to manage the selection state.
You no longer have to call [Tree API](/docs/reference/tree-api) methods to change the selection. Simply pass a new tree selection state object to the <DPropLink name="treeSelection" /> prop and the tree grid will be updated accordingly.

For example, if you want to select all nodes, set the <DPropLink name="treeSelection" /> prop to:

```tsx file="tree-selection.snippet.tsx" region="tree-selection-value-to-show-all-nodes-as" title="Tree selection value to show all nodes as selected"
```

For deselecting all nodes, the value should be:

```tsx file="tree-selection.snippet.tsx" region="all-nodes-as-deselected" title="All nodes as deselected"
```

Using controlled tree selection also gives you an easy way to restore a previously saved tree selection at any point in time.

```tsx file="tree-controlled-selection-example.demo.tsx" title="Using controlled tree selection" height="large"
```

