import * as React from 'react';

import { useDataSourceInternal } from '@infinite-table/infinite-react';

interface Person {
  name: string;
  age: number;
  id: string | number;
}

const persons: Person[] = [
  { name: 'bob', age: 1, id: 1 },
  { name: 'bill', age: 2, id: 2 },
];

const personsPromise: Promise<Person[]> = new Promise((resolve) => {
  setTimeout(() => {
    resolve(persons);
  }, 200);
});

const Cmp = () => {
  const {
    state: { loading, dataArray },
  } = useDataSourceInternal<Person>({
    data: personsPromise,
    primaryKey: 'id',
  });

  return (
    <div aria-label="container" style={{ color: 'tomato' }}>
      {loading ? 'loading' : null}
      {loading ? null : JSON.stringify(dataArray)}
    </div>
  );
};

export default () => <Cmp />;
