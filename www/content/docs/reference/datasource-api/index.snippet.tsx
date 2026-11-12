// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  DataSourceApi,
  InfiniteTable,
  InfiniteTableApi,
} from '@infinite-table/infinite-react';

{
  //#region intro
  <DataSource<DATA_TYPE>
    onReady={(api: DataSourceApi<DATA_TYPE>) => {
      // api is accessible here // #highlight
      // you may want to store a reference to it in a ref or somewhere in your app state
    }}
  />
  //#endregion
}

{
  //#region intro-2
  <InfiniteTable<DATA_TYPE>
    columns={[...]}
    onReady={(
      {api, dataSourceApi}: { // #highlight
        api: InfiniteTableApi<DATA_TYPE>,
        dataSourceApi: DataSourceApi<DATAT_TYPE>
      }) => {

      // both api and dataSourceApi are accessible here
    }}
  />
  //#endregion
}

{
  //#region adddata
  const promise1 = dataSourceApi.add({ ... })
  const promise2 = dataSourceApi.add({ ... })
  const promise3 = dataSourceApi.insertData({ ... }, { position: 'before', primaryKey: 4 })

  // promise1, promise2 and promise3 are the same promise
  // as the calls are run in the same raf and batched together
  // promise1 === promise2
  // promise1 === promise3
  //#endregion
}

{
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
}

{
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

{
  //#region updating-a-tree-node-by-path
  dataSourceApi.updateDataByNodePath({
    fileName: 'New Name',
    sizeInKB: 1000,
  }, ['1', '10']);
  //#endregion
}

{
  //#region removing-a-tree-node-by-path
  dataSourceApi.removeDataByNodePath(['1', '10']);
  //#endregion
}

{
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

export {};
