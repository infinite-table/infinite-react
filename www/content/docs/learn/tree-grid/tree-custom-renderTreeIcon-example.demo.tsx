import {
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';
import { useMemo, useState } from 'react';

type FileSystemNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  mimeType?: string;
  sizeInKB: number;
  children?: FileSystemNode[];
};

const allColumns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: { field: 'name', header: 'Name' },
  type: { field: 'type', header: 'Type' },
  extension: { field: 'extension', header: 'Extension' },
  mimeType: { field: 'mimeType', header: 'Mime Type' },
  size: { field: 'sizeInKB', type: 'number', header: 'Size (KB)' },
};

export default function App() {
  const [treeIcon, setTreeIcon] = useState<string>('name');

  const columns = useMemo(() => {
    const cols = { ...allColumns };

    cols[treeIcon] = {
      ...cols[treeIcon],
      renderTreeIcon: ({ rowInfo, toggleCurrentTreeNode }) => (
        <div
          onClick={toggleCurrentTreeNode}
          style={{
            width: 24,
            fontSize: 12,
            display: 'inline-block',
            cursor: 'pointer',
          }}
        >
          {rowInfo.isParentNode ? (rowInfo.nodeExpanded ? '👇' : '👉') : '🔴'}
        </div>
      ),
    };

    return cols;
  }, [treeIcon]);
  return (
    <>
      <TreeDataSource nodesKey="children" primaryKey="id" data={dataSource}>
        <div
          style={{
            color: 'var(--infinite-cell-color)',
            padding: '10px',
          }}
        >
          <p>Select the tree column</p>
          <select
            value={treeIcon}
            onChange={(e) => setTreeIcon(e.target.value)}
            title="Select column to use for the tree icon"
          >
            {Object.keys(allColumns).map((key) => (
              <option value={key}>{key}</option>
            ))}
            <option value="no">No tree column</option>
          </select>
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
            {
              id: '100',
              name: 'Report.docx',
              sizeInKB: 210,
              type: 'file',
              extension: 'docx',
              mimeType: 'application/msword',
            },
            {
              id: '101',
              name: 'Vacation.docx',
              sizeInKB: 120,
              type: 'file',
              extension: 'docx',
              mimeType: 'application/msword',
            },
            {
              id: '102',
              name: 'CV.pdf',
              sizeInKB: 108,
              type: 'file',
              extension: 'pdf',
              mimeType: 'application/pdf',
            },
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
        {
          id: '20',
          name: 'unknown.txt',
          sizeInKB: 108,
          type: 'file',
          extension: 'txt',
          mimeType: 'text/plain',
        },
      ],
    },
    {
      id: '3',
      name: 'Media',
      sizeInKB: 1000,
      type: 'folder',
      children: [
        {
          id: '30',
          name: 'Music',
          sizeInKB: 0,
          type: 'folder',
          children: [],
        },
        {
          id: '31',
          name: 'Videos',
          sizeInKB: 5400,
          type: 'folder',
          children: [
            {
              id: '310',
              name: 'Vacation.mp4',
              sizeInKB: 108,
              type: 'file',
              extension: 'mp4',
              mimeType: 'video/mp4',
            },
          ],
        },
      ],
    },
  ];
  return Promise.resolve(nodes);
};
