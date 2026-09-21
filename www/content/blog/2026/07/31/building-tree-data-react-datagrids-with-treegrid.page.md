---
title: Building tree-data React DataGrids with TreeGrid
description: Use Infinite Table's TreeDataSource and TreeGrid components to render nested data, control expand/collapse state, select nodes, and customize tree icons.
date: 2026-07-31
author: radu
tags: tree data, hierarchy, TreeGrid
---

Some datasets are naturally hierarchical.

File systems, product catalogs, asset inventories, org charts, permission models, and dependency graphs all have parent-child relationships that lose meaning when flattened into a plain list. Users expect to expand a parent, scan its children, select a branch, collapse noisy sections, and keep the rest of the grid behavior they already rely on.

Infinite Table's tree-data feature gives that shape a first-class API. The docs start with [Using Tree Data](/docs/learn/tree-grid/overview), and this article walks through the practical model behind it: load nested data with `TreeDataSource`, render it with `TreeGrid`, then use node paths to control state and actions.

## Start with TreeDataSource and TreeGrid

Tree rendering uses specialized components:

- `TreeDataSource` instead of `DataSource`
- `TreeGrid` instead of `InfiniteTable`

Those components keep the tree-specific types and props explicit while preserving the normal DataGrid concepts: columns, primary keys, async data, styling, keyboard behavior, and selection.

```tsx
import {
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  sizeInKB: number;
  children?: FileSystemNode[];
};

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: { field: 'name', renderTreeIcon: true, header: 'Name' },
  type: { field: 'type', header: 'Type' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
};

export default function App() {
  return (
    <TreeDataSource nodesKey="children" primaryKey="id" data={dataSource}>
      <TreeGrid columns={columns} />
    </TreeDataSource>
  );
}
```

There are three important details in that setup:

1. `nodesKey="children"` tells `TreeDataSource` where to find child nodes.
2. `primaryKey="id"` identifies each node in its local data shape.
3. `renderTreeIcon: true` marks the column that should show expand/collapse affordances.

The live docs example uses file-system data because the hierarchy is familiar: folders can contain folders, files are leaves, and empty folders are still parent nodes.

<Sandpack title="Basic TreeGrid setup" size="lg" viewMode="preview">

<Description>

Render nested file-system data with `TreeDataSource`, `TreeGrid`, and a `name` column that displays the tree icon. Full docs: [Using Tree Data](/docs/learn/tree-grid/overview).

</Description>

```tsx live file="$DOCS/learn/tree-grid/basic-tree-grid-example.page.tsx"

```

</Sandpack>

## Think in node paths, not only row ids

In a flat grid, a row id is enough. In a tree, the same interaction often needs the full route from root to the current node.

The docs call this a node path:

```tsx
const data = [
  {
    id: '1',
    name: 'Documents', // path: ['1']
    children: [
      {
        id: '10',
        name: 'Private', // path: ['1', '10']
        children: [
          {
            id: '100',
            name: 'Report.docx', // path: ['1', '10', '100']
          },
        ],
      },
    ],
  },
];
```

That array is the address of the node inside the tree. It is the value you use when you want to expand one branch, restore collapsed state, select a node, or call Tree API methods against a specific item.

This matters in real applications because users rarely want "the row with id 10" in isolation. They want "Private inside Documents", "Frontend inside Engineering", or "Spare parts inside Warehouse A". Node paths encode that context.

## Keep expand and collapse state declarative

By default, a tree renders fully expanded. That is useful while prototyping, but production screens usually need a more deliberate starting point:

- collapse noisy branches by default
- restore the user's last session
- show only top-level departments
- expand the branch that contains the active item

Use `defaultTreeExpandState` when the tree can own subsequent user updates:

```tsx
const defaultTreeExpandState = {
  defaultExpanded: true,
  collapsedPaths: [
    ['1', '10'],
    ['3', '31'],
  ],
  expandedPaths: [['3']],
};

<TreeDataSource
  nodesKey="children"
  primaryKey="id"
  data={dataSource}
  defaultTreeExpandState={defaultTreeExpandState}
>
  <TreeGrid columns={columns} />
</TreeDataSource>;
```

Use the controlled `treeExpandState` prop when the state belongs in your app: URL state, saved views, global filters, command palettes, or a side panel that changes the active branch. In controlled mode, pair it with `onTreeExpandStateChange` so user actions are reflected back into your state.

<Sandpack title="Tree expand and collapse state" size="lg" viewMode="preview">

<Description>

Start with selected branches collapsed, then use the Tree API buttons to expand or collapse the whole hierarchy.

</Description>

```tsx live file="$DOCS/learn/tree-grid/tree-default-expand-collapse-example.page.tsx"

```

</Sandpack>

The useful mental model is the same as many Infinite Table props: use the uncontrolled default prop for simple initial state, and the controlled prop when the rest of your application needs to coordinate with the grid.

## Add selection to parent and leaf nodes

Tree selection is more expressive than flat row selection because parent nodes and leaf nodes can both participate.

For example, a permissions screen might select an entire product area while explicitly excluding one child feature. A file picker might select a folder but keep one large subfolder deselected. A product taxonomy editor might select all descendants under a category, then restore that state later.

Tree selection state supports that shape:

```tsx
import type { TreeSelectionValue } from '@infinite-table/infinite-react';

const treeSelection: TreeSelectionValue = {
  defaultSelection: false,
  selectedPaths: [['1'], ['2', '20']],
  deselectedPaths: [['1', '10']],
};
```

When you enable tree selection, add `renderSelectionCheckBox: true` to the column that should display the checkbox. If no `selectionMode` is specified, using `defaultTreeSelection` or `treeSelection` defaults selection mode to `"multi-row"`.

```tsx
const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: {
    field: 'name',
    header: 'Name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
  },
};
```

<Sandpack title="Controlled tree selection" size="lg" viewMode="preview">

<Description>

Select and deselect nodes while the current `TreeSelectionValue` is kept in React state.

</Description>

```tsx live file="$DOCS/learn/tree-grid/tree-controlled-selection-example.page.tsx"

```

</Sandpack>

Controlled tree selection is especially useful when selections power another part of the UI: a details panel, a batch action toolbar, a report scope, or a form that stores the chosen hierarchy.

## Put the tree affordance where users expect it

By default, `TreeGrid` does not guess which column should show the expand/collapse icon. You choose the tree column by setting `renderTreeIcon` on a column.

For most grids, the hierarchy belongs in the main label column:

```tsx
const columns = {
  name: {
    field: 'name',
    header: 'Name',
    renderTreeIcon: true,
  },
  owner: { field: 'owner', header: 'Owner' },
  status: { field: 'status', header: 'Status' },
};
```

But the icon does not have to be static. `renderTreeIcon` can also be a function, so you can use your own visual language, render different icons for parent and leaf nodes, or put the hierarchy affordance on a different column.

```tsx
renderTreeIcon: ({ rowInfo, toggleCurrentTreeNode }) => (
  <button onClick={toggleCurrentTreeNode}>
    {rowInfo.isParentNode ? (rowInfo.nodeExpanded ? 'open' : 'closed') : 'leaf'}
  </button>
);
```

<Sandpack title="Custom tree icons" size="lg" viewMode="preview">

<Description>

Choose which column renders the tree affordance and customize the icon rendering for parent and leaf nodes.

</Description>

```tsx live file="$DOCS/learn/tree-grid/tree-custom-renderTreeIcon-example.page.tsx"

```

</Sandpack>

That control is useful when tree data is not the only important signal. In an asset grid, the hierarchy might live in the "Asset" column while status, owner, cost center, and location behave like normal columns. In a project plan, the tree affordance might sit next to the task name while dates and assignees remain scannable.

## Use the Tree API for product actions

Some interactions are easier to express as commands:

- "Expand all"
- "Collapse all"
- "Select this branch"
- "Deselect everything"
- "Open the node that matches this search result"

When `TreeDataSource` is ready, the DataSource API exposes `treeApi`:

```tsx
import type { DataSourceApi } from '@infinite-table/infinite-react';

const onReady = (api: DataSourceApi<FileSystemNode>) => {
  api.treeApi.expandAll();
  api.treeApi.collapseAll();
  api.treeApi.selectNode(['1', '10']);
  api.treeApi.toggleNode(['3', '31']);
};

<TreeDataSource
  onReady={onReady}
  nodesKey="children"
  primaryKey="id"
  data={dataSource}
/>;
```

The [Tree API reference](/docs/reference/tree-api) covers methods for expanding, collapsing, selecting, deselecting, and toggling nodes. For data mutations, use the DataSource API methods that target a node path, such as `updateDataByNodePath` and `removeDataByNodePath`.

This gives you a clean separation:

- controlled props for state your app owns
- Tree API methods for command-style UI actions
- DataSource API methods for changing the underlying node data

## Where tree data fits

Reach for `TreeGrid` when the nested structure is part of the user's task, not just an implementation detail.

Good fits include:

- file explorers and document libraries
- product catalogs and category trees
- org charts and team structures
- permission matrices with inherited access
- infrastructure inventories by account, region, and service
- work breakdown structures and project plans

In each case, flattening the data removes context. Tree rendering keeps that context visible while still giving you the DataGrid features around it: typed columns, async loading, selection, custom rendering, styling, keyboard interactions, and API access.

## Go deeper in the docs

- [Using Tree Data](/docs/learn/tree-grid/overview) - component setup, nested data format, node paths, and horizontal layout
- [Managing the tree expand/collapse state](/docs/learn/tree-grid/tree-expand-and-collapse-state) - default and controlled expand state
- [Using tree selection](/docs/learn/tree-grid/tree-selection) - parent/leaf node selection and controlled selection state
- [Managing the tree column and expand/collapse icon](/docs/learn/tree-grid/tree-column) - choosing the tree column and customizing icons
- [Tree API](/docs/reference/tree-api) - expand, collapse, select, deselect, and toggle methods

Start with the basic `TreeDataSource` plus `TreeGrid` example, then decide which pieces of tree state belong to the grid and which belong to your application. That boundary is what keeps a hierarchical DataGrid predictable as the feature grows.
