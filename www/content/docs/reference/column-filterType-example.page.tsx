import * as React from 'react';

import {
  DataSourceData,
  DataSource,
  InfiniteTable,
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

  salary: number;
};

const data: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
  },
  salary: {
    defaultFilterable: true,
    field: 'salary',
    type: 'number',
    filterType: 'salary',
  },

  firstName: {
    field: 'firstName',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency', defaultFilterable: false },
};

function getIcon(icon: string) {
  return () => (
    <div
      style={{
        width: 20,
        display: 'flex',
        justifyContent: 'center',
        flexFlow: 'row',
      }}
    >
      {icon}
    </div>
  );
}

const domProps = {
  style: {
    height: '100%',
  },
};
export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer>
          data={data}
          primaryKey="id"
          defaultFilterValue={[]}
          filterDelay={0}
          filterMode="local"
          filterTypes={{
            salary: {
              defaultOperator: 'gt',
              emptyValues: ['', null, undefined],
              operators: [
                {
                  name: 'gt',
                  label: 'Salary Greater Than',
                  components: {
                    Icon: getIcon('>'),
                  },
                  fn: ({ currentValue, filterValue }) => {
                    return currentValue > filterValue;
                  },
                },
                {
                  name: 'gte',
                  components: {
                    Icon: getIcon('>='),
                  },
                  label: 'Salary Greater Than or Equal',
                  fn: ({ currentValue, filterValue }) => {
                    return currentValue >= filterValue;
                  },
                },
                {
                  name: 'lt',
                  components: {
                    Icon: getIcon('<'),
                  },
                  label: 'Salary Less Than',
                  fn: ({ currentValue, filterValue }) => {
                    return currentValue < filterValue;
                  },
                },
                {
                  name: 'lte',
                  components: {
                    Icon: getIcon('<='),
                  },
                  label: 'Salary Less Than or Equal',
                  fn: ({ currentValue, filterValue }) => {
                    return currentValue <= filterValue;
                  },
                },
              ],
            },
          }}
        >
          <InfiniteTable<Developer>
            domProps={domProps}
            columnDefaultWidth={150}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
