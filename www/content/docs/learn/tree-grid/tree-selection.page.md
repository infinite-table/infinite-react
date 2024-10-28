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
