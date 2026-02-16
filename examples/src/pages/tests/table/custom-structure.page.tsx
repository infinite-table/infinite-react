import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
  DataSourceGroupBy,
  components,
  useDataSourceSelector,
} from '@infinite-table/infinite-react';
import * as React from 'react';

const { CheckBox } = components;

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

const columns: Record<string, InfiniteTableColumn<Developer>> = {
  age: {
    field: 'age',
    header: 'Age',
    type: 'number',
    defaultWidth: 100,
    renderValue: ({ value }) => value,
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultWidth: 210,
  },
  currency: { field: 'currency', header: 'Currency', defaultWidth: 100 },
  preferredLanguage: {
    field: 'preferredLanguage',
    header: 'Programming Language',
  },

  canDesign: {
    defaultWidth: 135,
    field: 'canDesign',
    header: 'Design Skills',
    renderValue: ({ value }) => {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CheckBox
            defaultChecked={value === null ? null : value === 'yes'}
            domProps={{
              style: {
                marginRight: 10,
              },
            }}
          />
          {value === null ? 'Some' : value === 'yes' ? 'Yes' : 'No'}
        </div>
      );
    },
  },
  country: {
    field: 'country',
    header: 'Country',
  },
  firstName: { field: 'firstName', header: 'First Name' },
  stack: { field: 'stack', header: 'Stack' },

  city: {
    field: 'city',
    header: 'City',
    renderHeader: ({ column }) => `${column.computedVisibleIndex} City`,
  },
};

export default function App() {
  const groupBy: DataSourceGroupBy<Developer>[] = React.useMemo(
    () => [
      {
        field: 'country',
      },
      { field: 'stack' },
    ],
    [],
  );

  return (
    <DataSource<Developer> data={dataSource} primaryKey="id" groupBy={groupBy}>
      <h1>Your DataGrid</h1>
      <AppGrid />
    </DataSource>
  );
}

function AppGrid() {
  const { dataArray } = useDataSourceSelector((ctx) => {
    return {
      dataArray: ctx.dataSourceState.dataArray,
    };
  });
  return (
    <div
      style={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyItems: 'stretch',
        gap: 10,
      }}
    >
      {dataArray.length} rows
      <InfiniteTable<Developer>
        groupRenderStrategy="single-column"
        defaultActiveRowIndex={0}
        domProps={{
          style: {
            flex: 1,
          },
        }}
        columns={columns}
        columnDefaultWidth={150}
      />
    </div>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};
