import {
  DataSourceApi,
  DataSourcePropMultiRowSelectionTarget,
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';
import { useCallback, useState } from 'react';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  sizeInKB: number;
  children?: FileSystemNode[];
};

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: {
    field: 'name',
    header: 'Name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
  },
  type: { field: 'type', header: 'Type' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
};

export default function App() {
  const [dataSourceApi, setDataSourceApi] =
    useState<DataSourceApi<FileSystemNode> | null>();
  const [target, setTarget] =
    useState<DataSourcePropMultiRowSelectionTarget>('visible');
  const [filter, setFilter] = useState('.docx');

  const treeFilterFunction = useCallback(
    ({
      data,
      filterTreeNode,
    }: {
      data: FileSystemNode;
      filterTreeNode: (data: FileSystemNode) => FileSystemNode | boolean;
    }) => {
      if (!Array.isArray(data.children)) {
        return data.name.toLowerCase().includes(filter.toLowerCase());
      }
      return filterTreeNode(data);
    },
    [filter],
  );

  return (
    <>
      <TreeDataSource
        onReady={setDataSourceApi}
        nodesKey="children"
        primaryKey="id"
        data={dataSource}
        selectionMode="multi-row"
        multiRowSelectionTarget={target}
        treeFilterFunction={filter ? treeFilterFunction : undefined}
      >
        <div
          style={{
            color: 'var(--infinite-cell-color)',
            padding: 10,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <label>
            multiRowSelectionTarget:{' '}
            <select
              value={target}
              onChange={(e) =>
                setTarget(
                  e.target.value as DataSourcePropMultiRowSelectionTarget,
                )
              }
            >
              <option value="all">all</option>
              <option value="visible">visible</option>
            </select>
          </label>
          <input
            placeholder="Filter files by name"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <button onClick={() => dataSourceApi!.treeApi.selectAll()}>
            Select all
          </button>
          <button onClick={() => dataSourceApi!.treeApi.deselectAll()}>
            Deselect all
          </button>
        </div>

        <TreeGrid columns={columns} />
      </TreeDataSource>
    </>
  );
}

const dataSource = () => {
  const nodes: FileSystemNode[] = [
    {
      id: '1',
      name: 'Documents',
      sizeInKB: 1200,
      type: 'folder',
      children: [
        {
          id: '10',
          name: 'Private',
          sizeInKB: 100,
          type: 'folder',
          children: [
            { id: '100', name: 'Report.docx', sizeInKB: 210, type: 'file' },
            { id: '101', name: 'Vacation.docx', sizeInKB: 120, type: 'file' },
            { id: '102', name: 'CV.pdf', sizeInKB: 108, type: 'file' },
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
        { id: '21', name: 'Notes.docx', sizeInKB: 50, type: 'file' },
      ],
    },
  ];
  return Promise.resolve(nodes);
};
