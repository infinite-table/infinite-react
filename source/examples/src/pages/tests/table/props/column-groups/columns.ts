import type { InfiniteTableColumn } from '@infinite-table/infinite-react';
import type { Person } from './rowData';

export const columns = new Map<string, InfiniteTableColumn<Person>>([
  ['id', { field: 'id' }], //todo when id is in address group, it should be repeated
  ['streetNo', { field: 'streetNo', columnGroup: 'street' }],
  ['city', { field: 'city', columnGroup: 'location' }],

  ['streetName', { field: 'streetName', columnGroup: 'street' }],
  ['firstName', { field: 'firstName' }],

  ['country', { field: 'country', columnGroup: 'location' }],
  ['region', { field: 'region', columnGroup: 'location' }],

  ['email', { field: 'email', columnGroup: 'contact info' }],
  ['phone', { field: 'phone', columnGroup: 'contact info' }],
]);
