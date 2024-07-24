import {
  InfiniteTable,
  DataSource,
  InfiniteTableProps,
} from '@infinite-table/infinite-react';

import type {
  InfiniteTablePropColumns,
  ScrollStopInfo,
} from '@infinite-table/infinite-react';
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
  monthlyBonus: number;
  birthDate: Date;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};
const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },
  salary: { field: 'salary', type: 'number' },
  currency: { field: 'currency', type: 'number' },
  birthDate: { field: 'birthDate', type: 'number' },
};

export default function App() {
  const onScrollStop: InfiniteTableProps<Developer>['onScrollStop'] =
    React.useCallback(
      ({
        renderRange,
        viewportSize,
        scrollTop,
        scrollLeft,
      }: ScrollStopInfo) => {
        console.log({ renderRange, viewportSize, scrollTop, scrollLeft });
      },
      [],
    );
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          onScrollStop={onScrollStop}
          columns={columns}
          columnDefaultWidth={250}
        />
      </DataSource>
    </>
  );
}
