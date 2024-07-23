import * as React from 'react';

import { DataSource, useDataSourceState } from '@infinite-table/infinite-react';

interface Person {
  name: string;
  age: number;
  id: string | number;
}

const persons: Person[] = [
  { name: 'bob', age: 1, id: 1 },
  { name: 'bill', age: 2, id: 2 },
];

const Cmp = () => {
  const ds = useDataSourceState<Person>();

  const { dataArray, loading } = ds;

  return (
    <div aria-label="container" style={{ color: 'tomato' }}>
      {loading ? 'loading' : null}
      {loading ? null : JSON.stringify(dataArray)}
    </div>
  );
};
const personsPromise: Promise<Person[]> = new Promise((resolve) => {
  setTimeout(() => {
    resolve(persons);
  }, 200);
});

export default () => {
  return (
    <DataSource<Person>
      data={personsPromise}
      primaryKey="id"
      fields={['name', 'id', 'age']}
    >
      <Cmp />
    </DataSource>
  );
};
