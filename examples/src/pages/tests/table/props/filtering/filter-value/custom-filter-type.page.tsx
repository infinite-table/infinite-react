import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourcePropFilterTypes,
  components,
} from '@infinite-table/infinite-react';

import * as React from 'react';

import { dataSource, Employee } from './custom-filter-type.data';

const { StringFilterEditor } = components;

const columns: Record<string, InfiniteTableColumn<Employee>> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  country: {
    field: 'country',
    header: 'Country',
    filterType: 'country',
  },
};

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
    emptyValues: [''],
    defaultOperator: 'same',
    operators: [
      {
        name: 'same',
        fn: ({ currentValue, filterValue, emptyValues }) => {
          if (
            emptyValues.includes(currentValue) ||
            emptyValues.includes(filterValue)
          ) {
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
          shouldReloadData={{
            filterValue: false,
          }}
          filterDelay={0}
        >
          <InfiniteTable<Employee>
            columnTypes={{
              country: {
                components: {
                  FilterEditor: StringFilterEditor,
                },
              },
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
