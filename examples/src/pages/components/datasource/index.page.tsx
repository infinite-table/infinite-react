import * as React from 'react';

import {
  DataSource,
  useDataSourceSelector,
} from '@infinite-table/infinite-react';

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
  const { dataArray, loading } = useDataSourceSelector((ctx) => {
    return {
      dataArray: ctx.dataSourceState.dataArray,
      loading: ctx.dataSourceState.loading,
    };
  });

  return (
    <div>
      {loading ? 'loading' : null}
      {loading ? null : `${dataArray.length} records`}
    </div>
  );
};
const personsPromise: Promise<Person[]> = new Promise((resolve) => {
  setTimeout(() => {
    resolve(persons);
  }, 2000);
});
export default () => {
  return (
    <div>
      <DataSource<Person>
        data={personsPromise}
        primaryKey="id"
        fields={['name', 'id', 'age']}
        sortInfo={{
          dir: 1,
          field: 'name',
        }}
      >
        <Cmp />
      </DataSource>
    </div>
  );
};
