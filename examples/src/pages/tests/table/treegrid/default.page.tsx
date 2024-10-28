import * as React from 'react';

import {
  InfiniteTableColumn,
  TreeDataSource,
  TreeGrid,
} from '@infinite-table/infinite-react';

import { FileSystemNode, nodes } from './default.data';

const columns: Record<string, InfiniteTableColumn<FileSystemNode>> = {
  name: {
    field: 'name',
    renderTreeIcon: true,
    renderSelectionCheckBox: true,
    renderValue: ({ value, data }) => {
      return (
        <>
          {value} - {data!.id}
        </>
      );
    },
  },
  type: { field: 'type' },
  sizeKB: { field: 'sizeKB' },
};

export default function DataTestPage() {
  return (
    <React.StrictMode>
      <TreeDataSource<FileSystemNode>
        data={nodes}
        primaryKey="id"
        nodesKey="children"
        selectionMode="multi-row"
        defaultTreeSelection={{
          defaultSelection: false,
          selectedPaths: [
            ['1', '4', '5'],
            ['1', '3'],
          ],
        }}
        defaultTreeExpandState={{
          defaultExpanded: true,
          collapsedPaths: [['8']],
        }}
      >
        <TreeGrid<FileSystemNode>
          wrapRowsHorizontally
          domProps={{
            style: {
              margin: '5px',
              height: 900,
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columns={columns}
        />
      </TreeDataSource>
    </React.StrictMode>
  );
}
