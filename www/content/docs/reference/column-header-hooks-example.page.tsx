import {
  InfiniteTable,
  DataSource,
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';

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

const HobbyHeader: React.FC = function () {
  const { column } = useInfiniteHeaderCell<Developer>();

  return <b style={{ color: '#0000c2' }}>{column?.field} 🤷📸👨🏻‍🍳💃📚⛹️</b>;
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', maxWidth: 80 },
  stack: {
    field: 'stack',
  },
  hobby: {
    field: 'hobby',
    header: HobbyHeader,
  },
};

export default function ColumnHeaderExampleWithHooks() {
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer> columns={columns} columnDefaultWidth={200} />
      </DataSource>
    </>
  );
}
