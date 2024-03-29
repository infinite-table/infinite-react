import * as React from 'react';

import {
  DataSourceData,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

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
  id: { field: 'id', defaultWidth: 80 },
  country: {
    field: 'country',
    header: 'Your country of residence',
    renderValue: ({ data }) => 'Country: ' + data?.country,
    align: 'center',
    defaultWidth: 500,
  },
  firstName: {
    field: 'firstName',
    header: 'First Name',
    align: 'end',
    defaultSortable: false,
    defaultFlex: 1,
  },
  preferredLanguage: {
    field: 'currency',

    defaultFlex: 1,
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
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columnDefaultWidth={140}
          columnMinWidth={50}
          columns={columns}
          getColumnMenuItems={(items, { columnApi }) => {
            items.push('-');
            items.push({
              key: 'close',
              label: 'Close',
              onClick: () => {
                columnApi.hideContextMenu();
              },
            });
            return items;
          }}
          getCellContextMenuItems={(_params, { api }) => {
            return [
              {
                key: 'close',
                label: 'Close',
                onClick: () => {
                  api.hideContextMenu();
                },
              },
            ];
          }}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;
