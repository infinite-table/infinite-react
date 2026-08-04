import type { InfiniteTableColumn } from '@infinite-table/infinite-react';
export type Developer = {
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

export const columns: Record<string, InfiniteTableColumn<Developer>> = {
  id: { field: 'id' },
  firstName: {
    field: 'firstName',
  },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

export const developers1kDataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

export const developers10DataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

export const height80vhDomProps = {
  style: {
    height: '80vh',
    margin: '10px',
  },
};
