import * as React from 'react';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
    columnGroup: 'info',
  },

  preferredLanguage: { field: 'preferredLanguage', columnGroup: 'info' },
  stack: { field: 'stack', columnGroup: 'other' },
  country: { field: 'country', columnGroup: 'other' },
};

const domProps = {
  style: {
    height: '80vh',
    margin: 10,
  },
};

function Cmp() {
  return <InfiniteTable.Body />;
}

export default function App() {
  const [colWidth, setColWidth] = React.useState(200);
  return (
    <>
      <button
        onClick={() => {
          setColWidth(colWidth === 200 ? 400 : colWidth === 400 ? 100 : 200);
        }}
      >
        toggle col width
      </button>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        defaultGroupBy={[{ field: 'country' }, { field: 'stack' }]}
        selectionMode="multi-cell"
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
          columnGroups={{
            info: {
              header: 'info',
            },
            other: {
              header: 'other',
            },
          }}
          keyboardNavigation={'cell'}
          columnDefaultWidth={colWidth}
        >
          <InfiniteTable.GroupingToolbar />
          <InfiniteTable.Header />

          <Cmp />

          <InfiniteTable.Header />
          {/* <Cmp /> */}
        </InfiniteTable>
      </DataSource>
    </>
  );
}
