import {
  DataSourceApi,
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
  TreeSelectionValue,
} from '@infinite-table/infinite-react';
import { useState } from 'react';

type FileSystemNode = {
  id: string;
  name: string;
  children?: FileSystemNode[];
};
const nodes: FileSystemNode[] = [
  {
    id: '1',
    name: 'Documents',
    children: [
      {
        id: '10',
        name: 'Private',
        children: [
          {
            id: '100',
            name: 'Report.docx',
          },
          {
            id: '101',
            name: 'Vacation.docx',
          },
          {
            id: '102',
            name: 'CV.pdf',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Desktop',
    children: [
      {
        id: '20',
        name: 'unknown.txt',
      },
    ],
  },
  {
    id: '3',
    name: 'Media',
    children: [
      {
        id: '30',
        name: 'Music',
      },
      {
        id: '31',
        name: 'Videos',
        children: [
          {
            id: '310',
            name: 'Vacation.mp4',
          },
          {
            id: '311',
            name: 'Youtube',
            children: [
              {
                id: '3110',
                name: 'Infinity',
              },
              {
                id: '3111',
                name: 'Infinity 2',
              },
            ],
          },
        ],
      },
    ],
  },
];

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: {
    field: 'name',
    header: 'Name',
    defaultWidth: 500,
    renderValue: ({ value, rowInfo }) => {
      return (
        <div style={{ color: 'red', display: 'inline-block' }}>
          {rowInfo.id} - {value}
        </div>
      );
    },
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
  },
};

const defaultTreeSelection: TreeSelectionValue = {
  defaultSelection: false,
  selectedPaths: [['3']],
  deselectedPaths: [['3', '31', '311', '3110']],
};

export default function App() {
  const [dataSourceApi, setDataSourceApi] =
    useState<DataSourceApi<FileSystemNode> | null>();

  const [treeSelectionState, setTreeSelectionState] =
    useState<TreeSelectionValue>(defaultTreeSelection);

  (globalThis as any).treeSelectionState = treeSelectionState;
  return (
    <>
      <TreeDataSource
        onReady={setDataSourceApi}
        nodesKey="children"
        primaryKey="id"
        data={dataSource}
        treeSelection={treeSelectionState}
        selectionMode="multi-row"
        onTreeSelectionChange={(_e, { treeSelectionState }) => {
          setTreeSelectionState({
            defaultSelection: false,
            selectedPaths: treeSelectionState.getSelectedLeafNodePaths(),
          });
        }}
      >
        <div
          style={{
            color: 'var(--infinite-cell-color)',
            padding: 10,
            display: 'flex',
            gap: 10,
          }}
        >
          <button
            onClick={() => {
              dataSourceApi!.treeApi.selectAll();
            }}
          >
            Select all
          </button>
          <button
            onClick={() => {
              dataSourceApi!.treeApi.deselectAll();
            }}
          >
            Deselect all
          </button>
        </div>

        <TreeGrid columns={columns} domProps={{ style: { height: '100%' } }} />
      </TreeDataSource>
    </>
  );
}

const dataSource = () => {
  return Promise.resolve(nodes);
};
