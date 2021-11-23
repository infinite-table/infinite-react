import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
  InfiniteTableColumnGroup,
} from '@infinite-table/infinite-react';

import { Person, data } from './column-groups-data';

const columnGroups: Map<string, InfiniteTableColumnGroup> =
  new Map([
    ['contact info', { header: 'Contact info' }],
    [
      'street',
      { header: 'street', columnGroup: 'address' },
    ],
    [
      'location',
      { header: 'location', columnGroup: 'address' },
    ],
    ['address', { header: 'Address' }],
  ]);

const columns = new Map<
  string,
  InfiniteTableColumn<Person>
>([
  ['id', { field: 'id' }],
  [
    'streetNo',
    { field: 'streetNo', columnGroup: 'street' },
  ],
  ['city', { field: 'city', columnGroup: 'location' }],

  [
    'streetName',
    { field: 'streetName', columnGroup: 'street' },
  ],
  ['firstName', { field: 'firstName' }],

  [
    'country',
    { field: 'country', columnGroup: 'location' },
  ],
  ['region', { field: 'region', columnGroup: 'location' }],

  [
    'email',
    { field: 'email', columnGroup: 'contact info' },
  ],
  [
    'phone',
    { field: 'phone', columnGroup: 'contact info' },
  ],
]);

export default function App() {
  return (
    <DataSource<Person> data={data} primaryKey="id">
      <InfiniteTable<Person>
        columnGroups={columnGroups}
        columnDefaultWidth={130}
        columnMinWidth={50}
        columns={columns}
      />
    </DataSource>
  );
}
