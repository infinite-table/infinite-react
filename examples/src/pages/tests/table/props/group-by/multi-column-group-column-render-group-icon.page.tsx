import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  InfiniteTablePropColumns,
  InfiniteTablePropGroupColumn,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  language: string;
};

const data: Developer[] = [
  { id: 1, firstName: 'Ana', country: 'Australia', language: 'Go' },
  { id: 2, firstName: 'John', country: 'Australia', language: 'Java' },
  { id: 3, firstName: 'Emma', country: 'Brazil', language: 'Go' },
];

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName' },
};

const groupBy: DataSourceGroupBy<Developer>[] = [
  { field: 'country' },
  { field: 'language' },
];

// wraps the default icon, so the test can tell where it is called
const groupColumn: InfiniteTablePropGroupColumn<Developer> = () => ({
  renderGroupIcon: ({ renderBag }) => (
    <span data-name="custom-group-icon">{renderBag.groupIcon}</span>
  ),
});

const domProps = {
  style: { height: '80vh' },
};

export default function App() {
  return (
    <DataSource<Developer> primaryKey="id" data={data} groupBy={groupBy}>
      <InfiniteTable<Developer>
        domProps={domProps}
        columns={columns}
        groupRenderStrategy="multi-column"
        groupColumn={groupColumn}
      />
    </DataSource>
  );
}
