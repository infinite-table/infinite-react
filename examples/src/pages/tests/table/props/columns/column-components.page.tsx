import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  useInfiniteColumnCell,
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';

import type {
  InfiniteTableColumn,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const ColumnCell = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef, value } = useInfiniteColumnCell<Developer>();

  return (
    <div ref={domRef} {...props} style={{ ...props.style, color: 'yellow' }}>
      x{value}x
    </div>
  );
};

const HeaderCell = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef, renderBag } = useInfiniteHeaderCell<Developer>();

  return (
    <div ref={domRef} {...props} style={{ ...props.style, color: 'red' }}>
      {renderBag.sortIcon}
      First name
    </div>
  );
};

const columns: InfiniteTablePropColumns<Developer> = new Map<
  string,
  InfiniteTableColumn<Developer>
>([
  ['id', { field: 'id' }],
  [
    'firstName',
    {
      field: 'firstName',
      render: () => {
        const { data } = useInfiniteColumnCell<Developer>();

        return <>{data?.firstName}!!!!!!</>;
      },

      components: {
        ColumnCell,
        HeaderCell,
      },
    },
  ],
  ['preferredLanguage', { field: 'preferredLanguage' }],
  ['stack', { field: 'stack' }],
  ['country', { field: 'country' }],
  ['canDesign', { field: 'canDesign' }],
  ['hobby', { field: 'hobby' }],
  ['city', { field: 'city' }],
  ['age', { field: 'age' }],
  ['salary', { field: 'salary', type: 'number' }],
  ['currency', { field: 'currency' }],
]);

const domProps = {
  style: {
    height: '80vh',
  },
};

export default function GroupByExample() {
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={dataSource}
      groupBy={[{ field: 'stack' }]}
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        columns={columns}
        columnDefaultWidth={200}
      />
    </DataSource>
  );
}
