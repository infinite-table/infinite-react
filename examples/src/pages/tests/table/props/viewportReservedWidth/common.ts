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
    defaultFlex: 1,
  },
  preferredLanguage: {
    field: 'preferredLanguage',
    header: 'This is my preferred language',
    defaultFlex: 3,
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultFlex: 2,
  },
  age: { field: 'age', defaultWidth: 150 },
};

export const developers10kDataSource: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};
