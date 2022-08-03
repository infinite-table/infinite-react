import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourcePropFilterValue,
  DataSourceData,
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

const dataSource: DataSourceData<Developer> = ({ filterValue, sortInfo }) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }

  const args = [
    filterValue
      ? 'filterBy=' +
        JSON.stringify(
          filterValue.map((filter) => {
            return {
              field: filter.field,
              value: filter.filterValue,
            };
          }),
        )
      : null,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s: any) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql?` + args)
    .then((r) => r.json())
    .then((data) => {
      return new Promise((resolve) => {
        data.totalCountUnfiltered = 100;
        resolve(data);
        // setTimeout(() => resolve(data), 1000);
      });
    });
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
    // so all 100 rows are displayed, and not virtualized
    height: 5000,
    flex: 'none',
    border: '1px solid gray',
    position: 'relative',
  },
};

export default function ServerSideFiltering() {
  const [filterValue, setFilterValue] = useState<
    DataSourcePropFilterValue<Developer> | undefined
  >();

  return (
    <>
      <h2>Current filter value:</h2>
      <button data-name="none" onClick={() => setFilterValue(undefined)}>
        Clear filter
      </button>
      <button
        data-name="stack"
        onClick={() =>
          setFilterValue([
            {
              field: 'stack',
              filterType: 'string',
              operator: 'eq',
              filterValue: 'frontend',
            },
          ])
        }
      >
        Filter by stack=frontend
      </button>
      <button
        data-name="country"
        onClick={() =>
          setFilterValue([
            {
              field: 'country',
              filterType: 'string',
              operator: 'eq',
              filterValue: 'United States',
            },
          ])
        }
      >
        Filter by country=United States
      </button>

      <React.StrictMode>
        <DataSource<Developer>
          data={dataSource}
          primaryKey="id"
          filterValue={filterValue}
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
