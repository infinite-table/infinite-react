import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import type {
  DataSourcePropGroupBy,
  DataSourcePropGroupRowsStateObject,
  GroupRowsState,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';

const groupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'country',
  },
  {
    field: 'stack',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
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
    DataSourcePropGroupRowsStateObject<string>
  >(() => {
    return {
      collapsedRows: true,
      expandedRows: [['Mexico'], ['Mexico', 'backend'], ['India']],
    };
  });

  const onGroupRowsStateChange = React.useCallback(
    (groupRowsState: GroupRowsState<string>) => {
      setGroupRowsState(groupRowsState.getState());
    },
    [],
  );

  return (
    <>
      <button
        onClick={() => {
          setGroupRowsState({
            expandedRows: true,
            collapsedRows: [],
          });
        }}
      >
        Expand all
      </button>
      <button
        onClick={() => {
          setGroupRowsState({
            expandedRows: [],
            collapsedRows: true,
          });
        }}
      >
        Collapse all
      </button>
      <DataSource<Developer>
        data={dataSource}
        primaryKey="id"
        groupBy={groupBy}
        groupRowsState={groupRowsState}
        onGroupRowsStateChange={onGroupRowsStateChange}
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
