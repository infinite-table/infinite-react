import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourcePropFilterValue,
  useDataSourceState,
} from '@infinite-table/infinite-react';
import * as React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import developers100 from '../../data/developers100';

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

const dataSource = (): Promise<Developer[]> => {
  return Promise.resolve(developers100 as Developer[]);
};

const columns: Record<string, InfiniteTableColumn<Developer>> = {
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
const domProps: React.HTMLAttributes<HTMLDivElement> = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative',
  },
};

function UnfilterdCount() {
  const { unfilteredCount } = useDataSourceState<Developer>();
  return (
    <p style={{ color: 'magenta' }} aria-label="unfiltered-count">
      unfiltered count: {unfilteredCount}
    </p>
  );
}
export default function RowStyleDefault() {
  const [filterValue, setFilterValue] = useState<
    DataSourcePropFilterValue<Developer> | undefined
  >([
    {
      field: 'preferredLanguage',

      filter: {
        type: 'string',
        operator: 'eq',
        value: 'Go',
      },
    },
  ]);

  return (
    <>
      <div className="flex gap-2 p-2">
        <Button data-name="none" onClick={() => setFilterValue(undefined)}>
          Clear filter
        </Button>

        <Button
          data-name="js"
          onClick={() =>
            setFilterValue([
              {
                field: 'preferredLanguage',
                filter: {
                  type: 'string',
                  operator: 'eq',
                  value: 'JavaScript',
                },
              },
            ])
          }
        >
          Filter by language=JavaScript
        </Button>
        <Button
          data-name="go"
          onClick={() =>
            setFilterValue([
              {
                field: 'preferredLanguage',
                // TODO use valueGetter instead of evaluationPolicy
                // but it's not serializable when used with server-side filtering
                // so look for a solution
                // idea: rowInfo should contain both rawValue and formattedValue, and displayValue?
                // valueGetter: ({ data, rowInfo }) => data.department,
                filter: {
                  type: 'string',
                  operator: 'eq',

                  value: 'Go',
                },
              },
            ])
          }
        >
          Filter by language=Go
        </Button>

        <Button
          onClick={() =>
            setFilterValue([
              {
                field: 'stack',
                filter: { type: 'string', operator: 'eq', value: 'frontend' },
              },
            ])
          }
        >
          filter by stack=frontend
        </Button>
      </div>

      <React.StrictMode>
        <DataSource<Developer>
          data={dataSource}
          primaryKey="id"
          shouldReloadData={{
            filterValue: false,
          }}
          filterValue={filterValue}
        >
          <InfiniteTable<Developer>
            domProps={domProps}
            columnDefaultWidth={150}
            columns={columns}
          />
          <UnfilterdCount />
        </DataSource>
      </React.StrictMode>
    </>
  );
}
