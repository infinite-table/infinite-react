import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTableColumn,
  TreeDataSource,
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
        selectionMode="single-row"
        defaultTreeSelection={'2'}
        defaultTreeExpandState={{
          defaultExpanded: true,
          collapsedPaths: [['8']],
        }}
      >
        <InfiniteTable<FileSystemNode>
          wrapRowsHorizontally
          keyboardNavigation="row"
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
