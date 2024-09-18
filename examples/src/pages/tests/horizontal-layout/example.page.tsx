import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  country: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
  salary: number;
};

const style = () => {
  return {
    background: `rgb(255 0 0 / 12%)`,
  };
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    style,
  },
  canDesign: {
    field: 'canDesign',
  },
  salary: {
    field: 'salary',
    type: 'number',
    // style,
  },
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
    // style,
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
  country: { field: 'country' },
};

export default () => {
  const dataSource = React.useCallback(() => {
    return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
      .then((r) => r.json())
      .then((data) => {
        return data;
        // return new Promise((resolve) => {
        //   setTimeout(() => {
        //     resolve(data);
        //   }, 10);
        // });
      });
  }, []);
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer>
          data={dataSource}
          primaryKey="id"
          defaultGroupBy={[
            {
              field: 'currency',
            },
            {
              field: 'stack',
            },
          ]}
        >
          <InfiniteTable<Developer>
            columns={columns}
            wrapRowsHorizontally={true}
            columnDefaultWidth={120}
            domProps={{
              style: {
                minHeight: '70vh',
              },
            }}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
