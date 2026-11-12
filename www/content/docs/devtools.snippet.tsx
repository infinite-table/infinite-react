// Snippets shown on devtools.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region intro
  <InfiniteTable
    debugId="unique id for devtools" // #highlight
  />
  //#endregion
}

{
  //#region intro-2
  const columns = {
    name: {
      field: 'firstName',
    },
    lastName: {
      field: 'lastName',
    },
    age: {
      field: 'age',
    },
  }

  const App = () => {
    return <DataSource primaryKey={'id'} data={[...]}>
      <InfiniteTable
        debugId="simple" // #highlight
        columns={columns}
      />
    </DataSource>
  }
  //#endregion
}

export {};
