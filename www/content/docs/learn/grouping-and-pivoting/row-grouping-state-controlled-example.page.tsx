import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
} from '@infinite-table/infinite-react';
import type {
  DataSourcePropGroupBy,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';

const groupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'country',
    column: {
      header: 'Country group',
      renderGroupValue: ({ value }) => <>Country: {value}</>,
    },
  },
  {
    field: 'stack',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
    // specifying a style here for the column
    // note: it will also be "picked up" by the group column
    // if you're grouping by the 'country' field
    style: {
      color: 'tomato',
    },
  },
  firstName: { field: 'firstName' },
  age: { field: 'age' },
  salary: {
    field: 'salary',
    type: 'number',
  },

  canDesign: { field: 'canDesign' },
  stack: { field: 'stack' },
};

export default function App() {
  const [groupRowsState, setGroupRowsState] = React.useState<
    GroupRowsState<string>
  >(() => {
    const groupRowsState = new GroupRowsState<string>({
      collapsedRows: true,
      expandedRows: [['Mexico'], ['Mexico', 'backend'], ['India']],
    });

    return groupRowsState;
  });

  return (
    <>
      <button
        onClick={() => {
          const newState = new GroupRowsState<string>(groupRowsState);
          newState.expandAll();
          setGroupRowsState(newState);
        }}
      >
        Expand all
      </button>
      <button
        onClick={() => {
          const newState = new GroupRowsState<string>(groupRowsState);
          newState.collapseAll();
          setGroupRowsState(newState);
        }}
      >
        Collapse all
      </button>
      <DataSource<Developer>
        data={dataSource}
        primaryKey="id"
        groupBy={groupBy}
        groupRowsState={groupRowsState}
        onGroupRowsStateChange={setGroupRowsState}
      >
        <InfiniteTable<Developer> columns={columns} />
      </DataSource>
    </>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};
