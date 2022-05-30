import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourcePropFilterTypes,
  StringFilterEditor,
} from '@infinite-table/infinite-react';
import { defaultFilterEditors } from '@infinite-table/infinite-react';
import * as React from 'react';

import { dataSource, Employee } from './custom-filter-type.data';

const columns = new Map<string, InfiniteTableColumn<Employee>>([
  [
    'firstName',
    {
      field: 'firstName',
      header: 'First Name',
    },
  ],
  [
    'country',
    {
      field: 'country',
      header: 'Country',
      filterType: 'country',
    },
  ],
]);

const domProps: React.HTMLAttributes<HTMLDivElement> = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative',
  },
};

const aliases: Record<string, string> = {
  usa: 'United States',
  it: 'Italy',
};

const filterTypes: DataSourcePropFilterTypes<Employee> = {
  country: {
    label: 'Country',
    emptyValues: new Set(['']),
    defaultOperator: 'same',
    operators: [
      {
        name: 'same',
        fn: ({ currentValue, filterValue, emptyValues }) => {
          if (emptyValues.has(currentValue) || emptyValues.has(filterValue)) {
            return true;
          }

          return (
            currentValue === filterValue ||
            aliases[currentValue] === filterValue
          );
        },
      },
    ],
  },
};
export default function RowStyleDefault() {
  return (
    <>
      <React.StrictMode>
        <DataSource<Employee>
          data={dataSource}
          primaryKey="id"
          defaultFilterValue={[]}
          filterTypes={filterTypes}
          filterMode="local"
          filterDelay={0}
        >
          <InfiniteTable<Employee>
            filterEditors={{
              ...defaultFilterEditors,
              country: StringFilterEditor,
            }}
            domProps={domProps}
            columnDefaultWidth={150}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
}
