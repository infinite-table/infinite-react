// Snippets shown on devtools.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
};

export function DebugId(props: { columns: InfiniteTablePropColumns<Developer> }) {
  const { columns } = props;
  return (
    //#region debug-id
    <InfiniteTable
      debugId="unique id for devtools" // #highlight
      columns={columns}
    />
    //#endregion
  );
}

export function debugIdApp() {
  //#region debug-id-app
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
    return <DataSource primaryKey={'id'} data={[/* ... */]}>
      <InfiniteTable
        debugId="simple" // #highlight
        columns={columns}
      />
    </DataSource>
  }
  //#endregion
  return App;
}
