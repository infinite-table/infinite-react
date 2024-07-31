import {
  InfiniteTable,
  DataSource,
  DataSourceData,
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
function getDataSource(size: string) {
  const dataSource: DataSourceData<Developer> = ({ sortInfo }) => {
    if (sortInfo && !Array.isArray(sortInfo)) {
      sortInfo = [sortInfo];
    }

    const args = [
      sortInfo
        ? 'sortInfo=' +
          JSON.stringify(sortInfo.map((s) => ({ field: s.field, dir: s.dir })))
        : null,
    ]
      .filter(Boolean)
      .join('&');
    return fetch(
      process.env.NEXT_PUBLIC_BASE_URL + `/developers${size}-sql?` + args,
    )
      .then((r) => r.json())
      .then(
        (data: Developer[]) =>
          new Promise<Developer[]>((resolve) => {
            setTimeout(() => {
              resolve(data);
            }, 1000);
          }),
      );
  };
  return dataSource;
}

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 100 },
  preferredLanguage: { field: 'preferredLanguage' },

  age: { field: 'age', defaultWidth: 70 },

  salary: {
    field: 'salary',
    type: 'number',
    defaultWidth: 100,
  },
};

const domProps = { style: { height: '90vh' } };

export default function App() {
  const [size, setSize] = React.useState('100');
  const dataSource = React.useMemo(() => {
    return getDataSource(size);
  }, [size]);
  return (
    <>
      <select
        value={size}
        onChange={(e) => {
          setSize(e.target.value);
        }}
      >
        <option value="10">10 items</option>
        <option value="100">100 items</option>
        <option value="1k">1k items</option>
        <option value="10k">10k items</option>
        <option value="50k">50k items</option>
      </select>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          onRenderRangeChange={(range) => {
            console.log(range.start[0], range.end[0]);
          }}
          domProps={domProps}
          columns={columns}
          columnDefaultWidth={220}
        />
      </DataSource>
    </>
  );
}
