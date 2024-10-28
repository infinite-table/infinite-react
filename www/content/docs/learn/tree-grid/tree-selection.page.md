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

If you enable selection, don't forget to specify which column should render a selection checkbox, by using <PropLink name="columns.renderSelectionCheckbox">renderSelectionCheckbox=true</PropLink>.

</Note>

<Sandpack title="Using default tree selection" size="lg">

```tsx file="tree-default-selection-example.page.tsx"
```

</Sandpack>
