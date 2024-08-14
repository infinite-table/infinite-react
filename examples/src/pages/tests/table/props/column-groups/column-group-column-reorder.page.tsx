import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumnGroup,
} from '@infinite-table/infinite-react';

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
  currency: {
    field: 'currency',
    columnGroup: 'finance',
    maxWidth: 130,
  },
  salary: {
    field: 'salary',
    columnGroup: 'finance',
    maxWidth: 130,
  },

  id: { field: 'id', defaultWidth: 80 },
  firstName: {
    field: 'firstName',
    columnGroup: 'name',
  },
  lastName: {
    field: 'lastName',
    columnGroup: 'name',
  },

  age: {
    field: 'age',
    columnGroup: 'personalInfo',
  },
  hobby: {
    field: 'hobby',
    columnGroup: 'personalInfo',
  },
  stack: {
    field: 'stack',
  },
  country: {
    field: 'country',
    columnGroup: 'regionalInfo',
  },
  preferredLanguage: {
    field: 'preferredLanguage',
    columnGroup: 'regionalInfo',
  },
};

const columnGroups: Record<string, InfiniteTableColumnGroup> = {
  regionalInfo: {
    header: 'Regional Info',
  },
  finance: {
    header: 'Finance',
    columnGroup: 'regionalInfo',
  },
  name: {
    header: 'Name',
    columnGroup: 'personalInfo',
  },
  personalInfo: {
    header: 'Personal Info',
  },
};

export default function ColumnValueGetterExample() {
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              width: '80vw',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columnGroups={columnGroups}
          columns={columns}
          columnDefaultWidth={100}
        />
      </DataSource>
    </>
  );
}
