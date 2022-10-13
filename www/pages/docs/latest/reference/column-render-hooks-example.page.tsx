import {
  InfiniteTable,
  DataSource,
  useInfiniteColumnCell,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';
import { HTMLProps } from 'react';

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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

function CustomCell(props: HTMLProps<HTMLElement>) {
  const { value, data } = useInfiniteColumnCell<Developer>();

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

  const label = data?.stack === 'frontend' ? '⚛️' : '';

  return (
    <b>
      {emoji} + {label}
    </b>
  );
}

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', maxWidth: 80 },
  firstName: { field: 'firstName' },
  hobby: {
    field: 'hobby',
    // we're not using the arg of the render function directly
    // but CustomCell uses `useInfiniteColumnCell` to retrieve it instead
    render: () => <CustomCell />,
  },
};

export default function ColumnRenderWithHooksExample() {
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer> columns={columns} columnDefaultWidth={200} />
      </DataSource>
    </>
  );
}
