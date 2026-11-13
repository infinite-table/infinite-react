// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  DataSourceApi,
  InfiniteTable,
  InfiniteTableApi,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  name: string;
  age: number;
};

// the page calls the type of the rows `DATA_TYPE`
type DATA_TYPE = Developer;

declare const data: DATA_TYPE[];
declare const columns: InfiniteTablePropColumns<DATA_TYPE>;

// the nodes of the tree snippets
type FileSystemNode = {
  id: string;
  fileName: string;
  sizeInKB: number;
  children?: FileSystemNode[];
};

export function DataSourceOnReady() {
  return (
    //#region intro
    <DataSource<DATA_TYPE>
      primaryKey="id"
      data={data}
      onReady={(api: DataSourceApi<DATA_TYPE>) => {
        // api is accessible here // #highlight
        // you may want to store a reference to it in a ref or somewhere in your app state
      }}
    />
    //#endregion
  );
}

export function InfiniteTableOnReady() {
  return (
    //#region intro-infinitetable-onready
    <InfiniteTable<DATA_TYPE>
      columns={columns}
      onReady={(
        {api, dataSourceApi}: { // #highlight
          api: InfiniteTableApi<DATA_TYPE>,
          dataSourceApi: DataSourceApi<DATA_TYPE>
        }) => {

        // both api and dataSourceApi are accessible here
      }}
    />
    //#endregion
  );
}

// This snippet leaves the rows out (`{ /* ... */ }`), so here the rows are
// partial: it's the methods and the insert position that are checked.
export function batchedCalls(dataSourceApi: DataSourceApi<Partial<Developer>>) {
  //#region adddata
  const promise1 = dataSourceApi.addData({ /* ... */ })
  const promise2 = dataSourceApi.addData({ /* ... */ })
  const promise3 = dataSourceApi.insertData({ /* ... */ }, { position: 'before', primaryKey: 4 })

  // promise1, promise2 and promise3 are the same promise
  // as the calls are run in the same raf and batched together
  // promise1 === promise2
  // promise1 === promise3
  //#endregion
  return [promise1, promise2, promise3];
}

export function updateTreeNodes(dataSourceApi: DataSourceApi<FileSystemNode>) {
  //#region updating-an-aray-of-tree-nodes
  dataSourceApi.updateDataArrayByNodePath([
    {
      data: {
        fileName: 'Vacation.pdf',
        sizeInKB: 1000,
      },
      nodePath: ['1', '10'],
    },
    {
      data: {
        fileName: 'Report.docx',
        sizeInKB: 2000,
      },
      nodePath: ['1', '11'],
    },
  ]);
  //#endregion

  //#region updating-a-tree-node-by-path
  dataSourceApi.updateDataByNodePath({
    fileName: 'New Name',
    sizeInKB: 1000,
  }, ['1', '10']);
  //#endregion

  //#region removing-a-tree-node-by-path
  dataSourceApi.removeDataByNodePath(['1', '10']);
  //#endregion
}

// this snippet names the nodes with `name` (the ones above use `fileName`)
type NamedNode = {
  id: string;
  name: string;
  children?: NamedNode[];
};

export function updateTreeNodeChildren(dataSourceApi: DataSourceApi<NamedNode>) {
  //#region updating-the-children-of-a-tree-node
  dataSourceApi.updateChildrenByNodePath(
    (currentChildren) => {
      return [
        ...(currentChildren || []),
        {
          name: 'untitled.txt',
          id: '8',
        },
      ];
    },
    ['1', '3'],
  );
  //#endregion
}

export function updateRow(dataSourceApi: DataSourceApi<Developer>) {
  //#region updatedata
  dataSourceApi.updateData({
    // if the primaryKey is the id, make sure to include it
    id: 1,

    // and then include any properties you want to update - in this case, the name and age
    name: 'John Doe',
    age: 30,
  });
  //#endregion
}
