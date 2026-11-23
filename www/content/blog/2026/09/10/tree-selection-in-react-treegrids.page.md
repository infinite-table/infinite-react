---
title: Tree selection in React TreeGrids
description: Use Infinite Table TreeGrid selection to select branches, restore saved selection, and control checkbox state without enumerating every row in a hierarchy.
date: 2026-09-10
author: radu
tags: tree-grid, selection, react-datagrid
---

Tree selection looks simple until the data becomes a hierarchy.

A flat grid can store selection as row ids. A tree UI usually needs more: select a whole folder, deselect one nested file, restore a user's previous choices, or apply "everything except archived" without loading every leaf node into state.

Infinite Table's [TreeGrid selection docs](/docs/learn/tree-grid/tree-selection) model that as tree state, not as a list of checked rows. Selection belongs to `<TreeDataSource />`, checkboxes render in the tree column, and selected nodes are described by their node paths.

## Selection belongs to TreeDataSource

Tree selection is configured on `<TreeDataSource />`, the same place where tree expand/collapse state lives.

```tsx {3}
<TreeDataSource
  nodesKey="children"
  primaryKey="id"
  defaultTreeSelection={defaultTreeSelection}
>
  <TreeGrid columns={columns} />
</TreeDataSource>
```

To make the state visible to users, render the selection checkbox in one of your columns:

```tsx {5}
const columns = {
  name: {
    field: 'name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
  },
};
```

If you set <DPropLink name="defaultTreeSelection" /> or its controlled counterpart <DPropLink name="treeSelection" /> without specifying <DPropLink name="selectionMode" />, Infinite Table defaults the selection mode to `"multi-row"` for the tree.

That keeps the selection behavior tied to the tree data model while the checkbox rendering stays a regular column concern.

## Select by default, then describe exceptions

The important part is the `TreeSelectionValue` shape:

```tsx
import type { TreeSelectionValue } from '@infinite-table/infinite-react';

const defaultTreeSelection: TreeSelectionValue = {
  defaultSelection: true,
  deselectedPaths: [
    ['1', '10'],
    ['3', '31'],
  ],
  selectedPaths: [['3']],
};
```

The `defaultSelection` flag says what the tree should assume when a node path is not listed explicitly.

- `defaultSelection: false` means "nothing is selected, except these selected paths"
- `defaultSelection: true` means "everything is selected, except these deselected paths"

That include/exclude model matters for large trees. If a permissions screen starts with every resource selected and the user turns off two branches, state does not need to list every selected leaf. It can say "selected by default, except these branches."

The example below starts with most of the file tree selected, except a couple of nested folders. The buttons call the Tree API to select or deselect everything.

<Sandpack title="Tree selection with checkboxes" size="lg" viewMode="preview">

<Description>

This example is reused from the TreeGrid docs. Select and deselect branches, then use the buttons above the grid to call the Tree API for all nodes.

</Description>

```tsx live file="$DOCS/learn/tree-grid/tree-default-selection-example.page.tsx"

```

</Sandpack>

## Node paths make branch state explicit

TreeGrid docs use `node path` instead of row id for tree state. A node path is the route from the root node to the current node:

```tsx
const data = [
  {
    id: '1', // path: ['1']
    name: 'Documents',
    children: [
      {
        id: '10', // path: ['1', '10']
        name: 'Private',
        children: [
          {
            id: '100', // path: ['1', '10', '100']
            name: 'Report.docx',
          },
        ],
      },
    ],
  },
];
```

Paths are a better fit for product UIs because they describe where the node lives, not only what its id is. That makes selection state useful for:

- document libraries where folders and files are selected together
- product catalogs with category-level bulk operations
- permission editors where parent resources affect sub-resources
- project plans where a parent task selection should include child tasks

When you need the current value, use <DPropLink name="onTreeSelectionChange" />. The callback fires both for user checkbox interactions and Tree API calls.

## Use the Tree API for imperative actions

Uncontrolled tree selection is a good default when the grid can own user interaction state. Pass <DPropLink name="defaultTreeSelection" /> once, then use the [Tree API](/docs/reference/tree-api) for product actions:

- <TreeApiLink name="selectAll" /> and <TreeApiLink name="deselectAll" />
- <TreeApiLink name="selectNode" /> and <TreeApiLink name="deselectNode" />
- <TreeApiLink name="toggleNodeSelection" />

```tsx
<TreeDataSource onReady={setDataSourceApi} defaultTreeSelection={value}>
  <button onClick={() => dataSourceApi!.treeApi.selectAll()}>Select all</button>
  <button onClick={() => dataSourceApi!.treeApi.deselectAll()}>
    Deselect all
  </button>

  <TreeGrid columns={columns} />
</TreeDataSource>
```

This is a natural fit for toolbar actions, context menu commands, and bulk-operation shortcuts. The grid keeps the selection state internally and emits changes when you need to react.

## Control selection when the app owns the workflow

Use controlled <DPropLink name="treeSelection" /> when selection has to live outside the grid:

- restoring a saved selection from user preferences
- syncing selection into URL state
- enabling a "review selected resources" side panel
- applying server-provided policy state
- keeping undo/redo history for permission edits

The controlled setup mirrors React state:

```tsx
const [treeSelection, setTreeSelection] = useState<TreeSelectionValue>({
  defaultSelection: false,
  selectedPaths: [['1', '10'], ['3']],
});

<TreeDataSource
  nodesKey="children"
  primaryKey="id"
  data={dataSource}
  treeSelection={treeSelection}
  onTreeSelectionChange={setTreeSelection}
>
  <TreeGrid columns={columns} />
</TreeDataSource>;
```

Once selection is controlled, you do not need Tree API calls for "select all" and "deselect all". Set the next value directly:

```tsx
// Select everything.
setTreeSelection({
  defaultSelection: true,
  deselectedPaths: [],
});

// Deselect everything.
setTreeSelection({
  defaultSelection: false,
  selectedPaths: [],
});
```

The controlled docs example below prints the selection state as you interact with the tree, which makes the include/exclude shape easy to inspect.

<Sandpack title="Controlled tree selection" size="lg" viewMode="preview">

<Description>

The app owns the `treeSelection` value and updates it through `onTreeSelectionChange`. Use the buttons to replace the whole selection state.

</Description>

```tsx live file="$DOCS/learn/tree-grid/tree-controlled-selection-example.page.tsx"

```

</Sandpack>

## Choosing controlled vs uncontrolled

Use <DPropLink name="defaultTreeSelection" /> when selection is mostly a grid interaction: the user checks boxes, maybe uses a toolbar action, and your app only needs to know the latest value.

Use <DPropLink name="treeSelection" /> when the rest of the product needs to own the selection lifecycle. If selection drives navigation, a submit button, persisted preferences, or server validation, keeping it in React state makes the flow explicit.

In both cases, the value shape is the same. You can start uncontrolled, listen through <DPropLink name="onTreeSelectionChange" />, and later move to a controlled value if the workflow grows.

## Go deeper in the docs

- [Using tree selection](/docs/learn/tree-grid/tree-selection) — `TreeSelectionValue`, uncontrolled and controlled examples
- [Using Tree Data](/docs/learn/tree-grid/overview) — `<TreeDataSource />`, `<TreeGrid />`, node paths, and tree terminology
- [Managing tree expand/collapse state](/docs/learn/tree-grid/tree-expand-and-collapse-state) — the parallel state model for opened and closed branches
- [Tree API reference](/docs/reference/tree-api) — selection, expand/collapse, and node update methods
- [Building a file explorer TreeGrid in React](/blog/2026/07/13/building-a-file-explorer-treegrid-in-react) — a broader walkthrough of nested data, expand state, selection, and custom icons
