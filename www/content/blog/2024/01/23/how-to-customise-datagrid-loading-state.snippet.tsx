// Snippets shown on how-to-customise-datagrid-loading-state.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
  type InfiniteTablePropColumns,
  type InfiniteTableProps,
} from '@infinite-table/infinite-react';

type Developer = {
  id: string;
  firstName: string;
};

// the first snippet spreads the rest of the props
declare const props: Partial<InfiniteTableProps<Developer>>;

export function CustomLoadingText() {
  //#region customising-the-loading-text
  const developers: Developer[] = [
    { id: '1', firstName: 'Bob' },
    { id: '2', firstName: 'Bill' },
  ];

  // make sure to add "loading" to the DataSource so you see the loading state
  <DataSource<Developer> loading data={developers} primaryKey="id">
    <InfiniteTable<Developer>
      loadingText={ // #highlight
        <span>Loading your data ...</span>
      }
      columns={{
        firstName: {
          field: 'firstName',
        },
        id: {
          field: 'id',
        }
      }}
      {...props}
    />
  </DataSource>
  //#endregion
  return null;
}

// the second snippet uses the rows and the columns of the first one
declare const developers: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

//#region customising-the-loadmask-component
// make sure to add "loading" to the DataSource so you see the loading state
export default function App() {
  return (
    <DataSource<Developer> loading data={developers} primaryKey="id">
      <InfiniteTable<Developer>
        components={{
          LoadMask, // #highlight
        }}
        columns={columns}
      />
    </DataSource>
  );
}

function LoadMask() { // #highlight
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        zIndex: 100,
        background: 'tomato',
        opacity: 0.3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          padding: 20,
          background: 'white',
          color: 'black',
          borderRadius: 5,
        }}
      >
        Loading App ...
      </div>
    </div>
  );
}
//#endregion
