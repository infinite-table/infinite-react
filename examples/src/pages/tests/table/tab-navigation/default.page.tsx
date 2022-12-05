import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceData,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

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
    {
      id: 4,
      firstName: 'Nadia',
      lastName: 'Maty',
      country: 'Canada',
      city: 'Quebec',
      currency: 'CAD',
    },
    {
      id: 5,
      firstName: 'Rich',
      lastName: 'Bobyard',
      country: 'USA',
      city: 'LA',
      currency: 'USD',
    },
    {
      id: 6,
      firstName: 'Hillary',
      lastName: 'Markinson',
      country: 'USA',
      city: 'NY',
      currency: 'USD',
    },
    {
      id: 7,
      firstName: 'Nat',
      lastName: 'Medson',
      country: 'Canada',
      city: 'Montreal',
      currency: 'CAD',
    },
    {
      id: 8,
      firstName: 'Joseph',
      lastName: 'Maty',
      country: 'Canada',
      city: 'Quebec',
      currency: 'CAD',
    },

    {
      id: 9,
      firstName: 'Michaela',
      lastName: 'Albertson',
      country: 'USA',
      city: 'LA',
      currency: 'USD',
    },
  ];
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 380 },
  country: {
    field: 'country',
    contentFocusable: true,
    renderValue: ({ rowIndex }) => (
      <input name="country" type="text" value={`${rowIndex}-country`} />
    ),
  },
  firstName: {
    field: 'firstName',
  },
  preferredLanguage: {
    field: 'currency',
    // editable: () => true,
    contentFocusable: true,
    renderValue: ({ rowIndex }) => (
      <input name="currency" type="text" value={`${rowIndex}-currency`} />
    ),
  },
};

export default function ColumnValueGetterExample() {
  return (
    <>
      <div>
        <input type="text" defaultValue={'John'} />
      </div>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          columns={columns}
          columnDefaultWidth={500}
          keyboardNavigation="cell"
          onSelfFocus={() => {
            // console.log('onSelfFocus');
          }}
          onReady={({ api }) => {
            (globalThis as any).infiniteApi = api;
          }}
          // defaultActiveCellIndex={[0, 0]}
          domProps={{
            style: {
              margin: 10,
              height: 150,
            },
          }}
        />
      </DataSource>
      <div>
        <input type="text" defaultValue={'Patrick'} />
      </div>
    </>
  );
}
