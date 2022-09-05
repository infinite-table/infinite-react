import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  DataSourcePropGroupBy,
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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  stack: {
    field: 'stack',
    renderGroupValue: ({ rowInfo }) => {
      return <>{rowInfo.value} stuff</>;
    },
    renderLeafValue: ({ value }) => {
      return <b>🎇 {value}</b>;
    },
  },
  firstName: {
    field: 'firstName',
  },

  preferredLanguage: { field: 'preferredLanguage' },
};
const groupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'country',
    column: {
      header: 'Country group',
      renderGroupValue: ({ value }) => <>Country: {value}</>,
    },
  },
];

export default function App() {
  return (
    <DataSource<Developer> data={dataSource} primaryKey="id" groupBy={groupBy}>
      <InfiniteTable<Developer>
        columns={columns}
        domProps={{ style: { height: 500 } }}
      />
    </DataSource>
  );
}
