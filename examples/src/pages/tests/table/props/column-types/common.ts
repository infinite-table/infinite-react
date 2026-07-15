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
  id: { field: 'id', type: 'numeric' },
  country: {
    field: 'country',
    type: null,
  },
  city: { field: 'city' },
  salary: { field: 'salary', type: ['default', 'numeric'] },
};

export const columnTypes = {
  default: {
    defaultWidth: 155,
  },
  numeric: {
    defaultWidth: 255,
    defaultSortable: false,
    header: 'number col',
  },
};

export const developers10DataSource = () => {
  return fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/developers10`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

export const columnTypesDomProps = {
  style: {
    margin: '5px',
    height: '60vh',
    width: '95vw',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
