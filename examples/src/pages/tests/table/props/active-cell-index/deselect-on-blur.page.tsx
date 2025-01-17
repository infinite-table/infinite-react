import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  type InfiniteTablePropColumns,
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

const dataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  country: { field: 'country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

export default function App() {
  const [activeCellIndex, setActiveCellIndex] = React.useState<
    [number, number] | null
  >(null);
  const [gridHasFocus, setGridHasFocus] = React.useState(false);
  return (
    <div>
      <input
        placeholder="Type something"
        className="border border-gray-700 p-2 m-2"
      />

      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          domProps={{ style: { height: '80vh' } }}
          columns={columns}
          activeCellIndex={gridHasFocus ? activeCellIndex : null}
          onActiveCellIndexChange={setActiveCellIndex}
          onSelfBlur={() => {
            setGridHasFocus(false);
          }}
          onSelfFocus={() => {
            setGridHasFocus(true);
          }}
        />
      </DataSource>
      <input
        placeholder="Type something else"
        className="border border-gray-700 p-2 m-2"
      />
    </div>
  );
}
