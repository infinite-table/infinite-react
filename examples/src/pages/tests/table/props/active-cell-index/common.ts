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

export const columns: Record<string, InfiniteTableColumn<Developer>> = {
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

export const developers100DataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

export const developers1kDataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

export const height800DomProps = {
  style: {
    // string with unit so the value works in both React and Vue style bindings
    height: '800px',
  },
};

export const defaultActiveCellIndex: [number, number] = [80, 2];
