import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceSortInfo,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
};

const defaultSortInfo: DataSourceSortInfo<Developer> = [
  {
    dir: 1,
    id: 'group-by',
    field: ['stack', 'preferredLanguage'],
  },
  // { dir: 1, field: 'age' },
];

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    age: 20,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    age: 25,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    age: 30,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  lastName: {
    field: 'lastName',
  },
  stack: {
    field: 'stack',
    // sortable: true,
  },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
  age: {
    field: 'age',
  },
  canDesign: {
    field: 'canDesign',
  },
};
export default () => {
  const [hideGroupColumns, update] = React.useState(true);
  return (
    <React.StrictMode>
      <>
        <button
          onClick={() => {
            update((c) => !c);
          }}
        >
          {hideGroupColumns ? 'show' : 'hide'}
        </button>
        <DataSource<Developer>
          data={data}
          primaryKey="id"
          defaultSortInfo={defaultSortInfo}
          defaultGroupBy={[
            {
              field: 'stack',
            },
            {
              field: 'preferredLanguage',
            },
          ]}
        >
          <InfiniteTable<Developer>
            domProps={{
              style: {
                margin: '5px',
                height: '80vh',
                border: '1px solid gray',
                position: 'relative',
              },
            }}
            groupRenderStrategy="single-column"
            rowHeight={40}
            hideColumnWhenGrouped={hideGroupColumns}
            columnDefaultWidth={150}
            columns={columns}
          />
        </DataSource>
      </>
    </React.StrictMode>
  );
};
