import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import { EXPIRED_LICENSE_KEY } from './expiredLicenseKey';

type Person = {
  id: number;
  firstName: string;
  age: number;
};

const data: Person[] = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  firstName: `Person ${index}`,
  age: 20 + index,
}));

const columns: InfiniteTablePropColumns<Person> = {
  id: { field: 'id', type: 'number' },
  firstName: { field: 'firstName' },
  age: { field: 'age', type: 'number' },
};

export default function ExpiredLicenseExample() {
  return (
    <DataSource<Person> data={data} primaryKey="id">
      <InfiniteTable<Person>
        licenseKey={EXPIRED_LICENSE_KEY}
        columns={columns}
        columnDefaultWidth={150}
        domProps={{
          style: { height: '80vh' },
        }}
      />
    </DataSource>
  );
}
