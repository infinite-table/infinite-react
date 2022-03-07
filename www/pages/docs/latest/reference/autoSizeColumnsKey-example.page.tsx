import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
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
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/developers1k'
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data)
    .then(
      (data) =>
        new Promise<Developer[]>((resolve) => {
          setTimeout(() => resolve(data), 1000);
        })
    );
};

const columns: InfiniteTablePropColumns<Developer> =
  new Map<string, InfiniteTableColumn<Developer>>([
    ['id', { field: 'id' }],
    ['firstName', { field: 'firstName' }],
    ['preferredLanguage', { field: 'preferredLanguage' }],
    ['stack', { field: 'stack' }],
    ['country', { field: 'country' }],
    ['age', { field: 'age' }],
    ['salary', { field: 'salary', type: 'number' }],
    ['currency', { field: 'currency' }],
  ]);

export default function GroupByExample() {
  const [key, setKey] = React.useState(0);
  const [includeHeader, setIncludeHeader] =
    React.useState(false);

  const autoSizeColumnsKey = React.useMemo(() => {
    return {
      includeHeader,
      key,
    };
  }, [key, includeHeader]);
  return (
    <>
      <div
        style={{
          color: 'var(--infinite-row-color)',
          background: 'var(--infinite-background)',
        }}>
        <label>
          <input
            checked={includeHeader}
            type={'checkbox'}
            onChange={(e) => {
              setIncludeHeader(e.target.checked);
            }}
          />{' '}
          Include header
        </label>

        <button
          style={{
            margin: 10,
            padding: 10,
            borderRadius: 5,
            border: '2px solid magenta',
          }}
          onClick={() => {
            setKey((key) => key + 1);
          }}>
          Click to auto-size
        </button>
      </div>

      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}>
        <InfiniteTable<Developer>
          autoSizeColumnsKey={autoSizeColumnsKey}
          columns={columns}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}
