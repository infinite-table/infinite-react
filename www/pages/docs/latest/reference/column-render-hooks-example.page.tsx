import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  useInfiniteColumnCell,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

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

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/developers1k'
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', maxWidth: 80 },
  firstName: { field: 'firstName' },
  hobby: {
    field: 'hobby',
    render: () => {
      const hookParams = useInfiniteColumnCell<Developer>();
      const { value, data } = hookParams;

      let emoji = '🤷';
      switch (value) {
        case 'photography':
          emoji = '📸';
          break;
        case 'cooking':
          emoji = '👨🏻‍🍳';
          break;
        case 'dancing':
          emoji = '💃';
          break;
        case 'reading':
          emoji = '📚';
          break;
        case 'sports':
          emoji = '⛹️';
          break;
      }

      const frontEnd =
        data?.stack === 'frontend' ? '⚛️' : '';

      return (
        <b>
          {emoji} + {frontEnd}
        </b>
      );
    },
  },
};

export default function ColumnValueGetterExample() {
  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}>
        <InfiniteTable<Developer>
          columns={columns}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}
