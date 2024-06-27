import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourceData,
  DataSourcePropSortInfo,
} from '@infinite-table/infinite-react';
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

const developers: Developer[] = [
  {
    id: 0,
    firstName: 'Nya',
    lastName: 'Klein',
    country: 'India',
    city: 'Unnao',
    age: 40,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'yes',
    salary: 60000,
    hobby: 'sports',
  },
  {
    id: 1,
    firstName: 'Axel',
    lastName: 'Runolfsson',
    country: 'Mexico',

    city: 'Cuitlahuac',

    age: 20,
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'no',
    salary: 100000,
    hobby: 'sports',
  },
  {
    id: 2,
    firstName: 'Gonzalo',
    lastName: 'McGlynn',
    country: 'United Arab Emirates',
    city: 'Fujairah',
    age: 60,
    currency: 'JPY',
    preferredLanguage: 'Go',
    stack: 'frontend',
    canDesign: 'yes',
    salary: 120000,
    hobby: 'photography',
  },
];

const dataSource: DataSourceData<Developer> = () => {
  (globalThis as any).timesCalled = ((globalThis as any).timesCalled || 0) + 1;
  return developers;
};

const columns: Record<string, InfiniteTableColumn<Developer>> = {
  identifier: {
    field: 'id',
  },
  name: {
    field: 'firstName',
    name: 'First Name',
  },
  city: { field: 'city' },
  stack: { field: 'stack' },

  fullName: {
    name: 'Full name',
    render: ({ data }) => {
      return (
        <>
          {data?.firstName} - {data?.lastName}
        </>
      );
    },
  },
  age: {
    field: 'age',
    type: 'number',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  country: {
    field: 'country',
  },
};
const domProps: React.HTMLAttributes<HTMLDivElement> = {
  style: {
    margin: '5px',

    minHeight: '500px',
  },
};

export default function SortInfoChanges() {
  const [sortInfo, setSortInfo] = useState<
    DataSourcePropSortInfo<Developer> | undefined
  >([
    {
      field: 'age',
      dir: 1,
    },
  ]);
  const [sortMode, setSortMode] = useState<'local' | 'remote'>('local');
  return (
    <>
      <button onClick={() => setSortMode('local')}>sort mode local</button>
      <button onClick={() => setSortMode('remote')}>sort mode remote</button>
      <p style={{ color: 'tomato' }}>Current sort mode: {sortMode}</p>
      <React.StrictMode>
        <DataSource<Developer>
          data={dataSource}
          primaryKey="id"
          shouldReloadData={{
            sortInfo: sortMode === 'remote',
          }}
          onSortInfoChange={setSortInfo}
          sortInfo={sortInfo}
        >
          <InfiniteTable<Developer>
            domProps={domProps}
            columnDefaultWidth={150}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
}
