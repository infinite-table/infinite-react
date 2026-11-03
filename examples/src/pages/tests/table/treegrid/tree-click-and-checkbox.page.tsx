import * as React from 'react';

import {
  TreeDataSource,
  TreeGrid,
  InfiniteTablePropColumns,
  InfiniteTablePropMultiRowSelectionWith,
  TreeExpandStateValue,
  TreeSelectionState,
  TreeSelectionValue,
} from '@infinite-table/infinite-react';
import { useState } from 'react';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemNode[];
};

const file = (id: string): FileSystemNode => ({ id, name: id, type: 'file' });
const folder = (id: string, children: FileSystemNode[]): FileSystemNode => ({
  id,
  name: id,
  type: 'folder',
  children,
});

// displayed, with pics collapsed:
// docs (a, b), pics (x, y), music (s1, s2, sub (t1))
const nodes: FileSystemNode[] = [
  folder('docs', [file('a'), file('b')]),
  folder('pics', [file('x'), file('y')]),
  folder('music', [file('s1'), file('s2'), folder('sub', [file('t1')])]),
];

const domProps = {
  style: {
    height: '80vh',
  },
};

const defaultTreeExpandState: TreeExpandStateValue = {
  defaultExpanded: true,
  collapsedPaths: [['pics']],
};

const multiRowSelection: TreeSelectionValue = {
  defaultSelection: false,
  selectedPaths: [],
};

export default function TreeClickAndCheckbox() {
  const [singleRow, setSingleRow] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [selectWith, setSelectWith] =
    useState<InfiniteTablePropMultiRowSelectionWith>('checkbox');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const columns = React.useMemo<InfiniteTablePropColumns<FileSystemNode>>(
    () => ({
      name: {
        field: 'name',
        renderTreeIcon: true,
        renderSelectionCheckBox: checkbox,
      },
      type: { field: 'type' },
    }),
    [checkbox],
  );

  const button = (name: string, onClick: VoidFunction) => (
    <button data-name={name} onClick={onClick}>
      {name}
    </button>
  );

  const setMode = (single: boolean) => {
    setSingleRow(single);
    setSelectedIds([]);
  };

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {button('single-row', () => setMode(true))}
        {button('multi-row', () => setMode(false))}
        {button('checkbox-on', () => setCheckbox(true))}
        {button('checkbox-off', () => setCheckbox(false))}
        {button('select-with-click', () => setSelectWith('click'))}
        {button('select-with-checkbox', () => setSelectWith('checkbox'))}
      </div>
      <pre data-name="selection-config">
        {JSON.stringify({ singleRow, checkbox, selectWith })}
      </pre>
      <pre data-name="selected-ids">{JSON.stringify(selectedIds)}</pre>
      <TreeDataSource<FileSystemNode>
        key={singleRow ? 'single-row' : 'multi-row'}
        data={nodes}
        primaryKey="id"
        nodesKey="children"
        defaultTreeExpandState={defaultTreeExpandState}
        {...(singleRow
          ? {
              selectionMode: 'single-row' as const,
              defaultTreeSelection: null,
              onTreeSelectionChange: (value: string | number | null) => {
                setSelectedIds(value == null ? [] : [`${value}`]);
              },
            }
          : {
              selectionMode: 'multi-row' as const,
              defaultTreeSelection: multiRowSelection,
              onTreeSelectionChange: (
                _value: TreeSelectionValue,
                { treeSelectionState }: { treeSelectionState: TreeSelectionState },
              ) => {
                setSelectedIds(
                  treeSelectionState
                    .getSelectedLeafNodePaths()
                    .map((path) => path[path.length - 1])
                    .sort(),
                );
              },
            })}
      >
        <TreeGrid<FileSystemNode>
          domProps={domProps}
          columns={columns}
          multiRowSelectionWith={selectWith}
          columnDefaultWidth={200}
        />
      </TreeDataSource>
    </>
  );
}
