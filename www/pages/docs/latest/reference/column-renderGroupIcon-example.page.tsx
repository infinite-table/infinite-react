import {
  InfiniteTable,
  DataSource,
  DataSourcePropGroupBy,
  InfiniteTablePropColumns,
  InfiniteTableColumn,
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
  { field: 'preferredLanguage' },
];

const groupColumn: InfiniteTableColumn<Developer> = {
  renderGroupIcon: ({ rowInfo, toggleCurrentGroupRow }) => {
    return (
      <div
        onClick={toggleCurrentGroupRow}
        style={{ cursor: 'pointer', marginRight: 10 }}
      >
        {rowInfo.isGroupRow ? (rowInfo.collapsed ? '👇' : '👉') : ''}
      </div>
    );
  },
};

export default function App() {
  return (
    <DataSource<Developer> data={dataSource} primaryKey="id" groupBy={groupBy}>
      <InfiniteTable<Developer> columns={columns} groupColumn={groupColumn} />
    </DataSource>
  );
}
