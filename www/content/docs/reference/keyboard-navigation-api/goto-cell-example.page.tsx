import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  InfiniteTableKeyboardNavigationApi,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';
import { useState } from 'react';

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

const dataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  country: { field: 'country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

export default function App() {
  const [keyboardNavigationApi, setKeyboardNavigationApi] = useState<
    InfiniteTableKeyboardNavigationApi<Developer> | undefined
  >(undefined);

  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <div>
          <button
            onClick={() => {
              keyboardNavigationApi?.gotoCell({ direction: 'top' });
            }}
          >
            Go to top
          </button>
          <div>
            <button
              onClick={() => {
                keyboardNavigationApi?.gotoCell({ direction: 'left' });
              }}
            >
              Go to left
            </button>
            <button
              onClick={() => {
                keyboardNavigationApi?.gotoCell({ direction: 'right' });
              }}
            >
              Go to right
            </button>
          </div>
          <button
            onClick={() => {
              keyboardNavigationApi?.gotoCell({ direction: 'bottom' });
            }}
          >
            Go to bottom
          </button>
        </div>
        <InfiniteTable<Developer>
          // keyboardNavigation="cell" is the default, so no need to specify it
          columns={columns}
          defaultActiveCellIndex={[0, 0]}
          onReady={({ api }) => {
            setKeyboardNavigationApi(api.keyboardNavigationApi);
          }}
        />
      </DataSource>
    </>
  );
}
