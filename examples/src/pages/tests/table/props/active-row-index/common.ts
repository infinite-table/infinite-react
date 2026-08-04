import type { DataSourceData, InfiniteTableColumn } from '@infinite-table/infinite-react';

export type Developer = {
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

export const defaultColumns: Record<string, InfiniteTableColumn<Developer>> = {
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

export const disabledRowColumns: Record<string, InfiniteTableColumn<Developer>> = {
  preferredLanguage: { field: 'preferredLanguage' },
  id: { field: 'id' },
  country: { field: 'country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

export const developers100DataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

export const developers10DataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

export const activeRowDomProps = {
  autoFocus: true,
  style: {
    // string with unit so the value works in both React and Vue style bindings
    height: '800px',
  },
};
