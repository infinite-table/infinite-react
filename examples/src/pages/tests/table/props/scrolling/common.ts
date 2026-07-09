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
  index: {
    renderValue: ({ rowInfo }: { rowInfo: { indexInAll: number } }) => {
      return `${rowInfo.indexInAll}`;
    },
  },
  preferredLanguage: {
    field: 'preferredLanguage',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  city: { field: 'city' },
  email: { field: 'email' },
  canDesign: { field: 'canDesign' },
  stack: { field: 'stack' },
};

export const developers10kDataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

export const renderRangeDomProps = {
  style: {
    margin: '5px',
    height: '60vh',
    width: '80vw',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
