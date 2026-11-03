import {
  InfiniteTableColumn,
  InfiniteTablePropMultiRowSelectionWith,
  TreeDataSource,
  TreeExpandStateValue,
  TreeGrid,
  TreeSelectionValue,
} from '@infinite-table/infinite-react';
import { useMemo, useState } from 'react';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  sizeInKB: number;
  children?: FileSystemNode[];
};

const defaultTreeSelection: TreeSelectionValue = {
  defaultSelection: false,
  selectedPaths: [],
};

const defaultTreeExpandState: TreeExpandStateValue = {
  defaultExpanded: true,
  collapsedPaths: [['1', '10']],
};

export default function App() {
  const [checkbox, setCheckbox] = useState(false);
  const [selectWith, setSelectWith] =
    useState<InfiniteTablePropMultiRowSelectionWith>('checkbox');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const columns = useMemo<Record<string, InfiniteTableColumn<FileSystemNode>>>(
    () => ({
      name: {
        field: 'name',
        header: 'Name',
        renderTreeIcon: true,
        renderSelectionCheckBox: checkbox,
      },
      type: { field: 'type', header: 'Type' },
      size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
    }),
    [checkbox],
  );

  return (
    <>
      <div
        style={{
          color: 'var(--infinite-cell-color)',
          padding: 10,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <button onClick={() => setCheckbox(!checkbox)}>
          {checkbox ? 'Hide' : 'Show'} selection checkboxes
        </button>
        <button
          onClick={() =>
            setSelectWith(selectWith === 'click' ? 'checkbox' : 'click')
          }
        >
          multiRowSelectionWith: {selectWith}
        </button>
      </div>
      <div style={{ color: 'var(--infinite-cell-color)', padding: 10 }}>
        Selected files: {selectedFiles.join(', ') || 'none'}
      </div>
      <TreeDataSource<FileSystemNode>
        nodesKey="children"
        primaryKey="id"
        data={nodes}
        selectionMode="multi-row"
        defaultTreeExpandState={defaultTreeExpandState}
        defaultTreeSelection={defaultTreeSelection}
        onTreeSelectionChange={(_selection, { treeSelectionState }) => {
          setSelectedFiles(
            treeSelectionState
              .getSelectedLeafNodePaths()
              .map((path) => names[path[path.length - 1]]),
          );
        }}
      >
        <TreeGrid columns={columns} multiRowSelectionWith={selectWith} />
      </TreeDataSource>
    </>
  );
}

const nodes: FileSystemNode[] = [
  {
    id: '1',
    name: 'Documents',
    sizeInKB: 1200,
    type: 'folder',
    children: [
      { id: '11', name: 'Report.docx', sizeInKB: 210, type: 'file' },
      {
        id: '10',
        name: 'Private',
        sizeInKB: 100,
        type: 'folder',
        children: [
          { id: '100', name: 'Vacation.docx', sizeInKB: 120, type: 'file' },
          { id: '101', name: 'CV.pdf', sizeInKB: 108, type: 'file' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Desktop',
    sizeInKB: 1000,
    type: 'folder',
    children: [
      { id: '20', name: 'unknown.txt', sizeInKB: 100, type: 'file' },
      { id: '21', name: 'notes.txt', sizeInKB: 20, type: 'file' },
    ],
  },
  {
    id: '3',
    name: 'Media',
    sizeInKB: 1000,
    type: 'folder',
    children: [
      {
        id: '31',
        name: 'Videos',
        sizeInKB: 5400,
        type: 'folder',
        children: [
          { id: '310', name: 'Vacation.mp4', sizeInKB: 108, type: 'file' },
        ],
      },
    ],
  },
];

const names: Record<string, string> = {};
const collectNames = (list: FileSystemNode[]) =>
  list.forEach((node) => {
    names[node.id] = node.name;
    if (node.children) {
      collectNames(node.children);
    }
  });
collectNames(nodes);
