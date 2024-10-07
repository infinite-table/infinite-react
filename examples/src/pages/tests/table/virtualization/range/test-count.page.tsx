import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  DataSourceData,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
};

const dataSource: DataSourceData<Developer> = ({}) => {
  return [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Bobson',
      country: 'USA',
      city: 'LA',
      currency: 'USD',
    },
    {
      id: 2,
      firstName: 'Bill',
      lastName: 'Richardson',
      country: 'USA',
      city: 'NY',
      currency: 'USD',
    },
    {
      id: 3,
      firstName: 'Nat',
      lastName: 'Natson',
      country: 'Canada',
      city: 'Montreal',
      currency: 'CAD',
    },
  ];
};
const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 200 },
  country: {
    field: 'country',
    defaultWidth: 10,
  },
  firstName: {
    field: 'firstName',
    align: 'end',
    defaultWidth: 230,
  },
  preferredLanguage: {
    field: 'currency',
    defaultWidth: 200,
  },
  lastName: {
    field: 'lastName',
    defaultWidth: 210,
  },
  city: {
    field: 'city',
    defaultWidth: 10,
  },
  currency: {
    field: 'currency',
    defaultWidth: 300,
  },
  extra: {
    valueGetter: () => 'extra',
    defaultWidth: 10,
  },
};
const App = () => {
  return (
    <React.StrictMode>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          domProps={{
            style: {
              margin: '5px',
              // height: '80vh',
              height: 350,
              width: 200,
            },
          }}
          header={true}
          columnDefaultWidth={140}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
