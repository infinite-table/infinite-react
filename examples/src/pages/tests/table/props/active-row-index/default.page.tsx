import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  InfiniteTableApi,
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

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource: DataSourceData<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql`)
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

export default function KeyboardNavigationForRows() {
  const [infiniteTableApi, setInfiniteTableApi] =
    useState<InfiniteTableApi<Developer>>();

  return (
    <>
      <button
        onClick={() => {
          infiniteTableApi!.scrollLeft = 100;
        }}
      >
        scroll left = 100
      </button>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          onReady={({ api }) => {
            setInfiniteTableApi(api);
          }}
          columns={columns}
          defaultActiveRowIndex={99}
          keyboardNavigation="row"
          domProps={{
            autoFocus: true,
            style: {
              height: 800,
            },
          }}
          columnPinning={{
            stack: true,
          }}
        />
      </DataSource>
    </>
  );
}
