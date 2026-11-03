import * as React from 'react';

import {
  DataSource,
  InfiniteTable,
  InfiniteTablePropColumns,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';

import { data, height80vhDomProps, type Developer } from './common';

const columns: InfiniteTablePropColumns<Developer> = {
  checkbox: { renderSelectionCheckBox: true, defaultWidth: 70 },
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
};

// JavaScript rows (ids 1 and 2, both in "frontend") are filtered out.
// Visible: frontend / Bill (3), backend / Mark (4), Matthew (5).
const filterFunction = ({ data }: { data: Developer }) =>
  data.preferredLanguage !== 'JavaScript';

type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
};

const treeNodes: TreeNode[] = [
  {
    id: 'docs',
    name: 'docs',
    children: [
      { id: 'a', name: 'a' },
      { id: 'b', name: 'b' },
    ],
  },
  {
    id: 'solo',
    name: 'solo',
    children: [{ id: 'z', name: 'z' }],
  },
];

const treeColumns: InfiniteTablePropColumns<TreeNode> = {
  name: {
    field: 'name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
  },
};

function Grouped() {
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={data}
      selectionMode="multi-row"
      multiRowSelectionTarget="all"
      groupBy={[{ field: 'stack' }]}
      filterFunction={filterFunction}
    >
      <InfiniteTable<Developer>
        domProps={height80vhDomProps}
        columns={columns}
      />
    </DataSource>
  );
}

function Tree() {
  return (
    <TreeDataSource<TreeNode>
      primaryKey="id"
      nodesKey="children"
      data={treeNodes}
      selectionMode="multi-row"
      defaultTreeExpandState={{ defaultExpanded: true, collapsedPaths: [] }}
      defaultTreeSelection={{ defaultSelection: false, selectedPaths: [] }}
    >
      <TreeGrid<TreeNode>
        domProps={height80vhDomProps}
        columns={treeColumns}
        columnDefaultWidth={220}
      />
    </TreeDataSource>
  );
}

export default function PartialBackgroundPage() {
  const [kind, setKind] = React.useState<'group' | 'tree'>('group');
  (globalThis as any).setKind = setKind;

  return kind === 'tree' ? <Tree /> : <Grouped />;
}
