import '@infinite-table/infinite-react/index.css';
import {
  InfiniteTable,
  DataSource,
  DataSourceSortInfo,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import * as React from 'react';

type Developer = {
  birthDate: string;
  id: number;
  firstName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  hobby: string;
  salary: number;
};

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName', header: 'First Name' },
  birthDate: {
    field: 'birthDate',
    header: 'Birth Date',
    type: 'datestring',
    defaultWidth: 150,
  },
  salary: {
    field: 'salary',
    header: 'Salary',
    type: 'number',
  },
  country: { field: 'country', header: 'Country' },
  preferredLanguage: { field: 'preferredLanguage' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const sortTypes = {
  datestring: (a: string, b: string) => {
    return new Date(a).getTime() - new Date(b).getTime();
  },
};

const defaultSortInfo: DataSourceSortInfo<Developer> = [
  {
    field: 'birthDate',
    dir: -1,
  },
];

export default function LocalUncontrolledSingleSortingExample() {
  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        sortTypes={sortTypes}
        defaultSortInfo={defaultSortInfo}
      >
        <InfiniteTable<Developer> columns={columns} columnDefaultWidth={120} />
      </DataSource>
    </>
  );
}

const dataSource: Developer[] = [
  {
    id: 0,
    firstName: 'Nya',
    country: 'India',
    city: 'Unnao',
    birthDate: '1997-01-01',
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    salary: 60000,
    hobby: 'sports',
    email: 'Nya44@gmail.com',
  },
  {
    id: 1,
    firstName: 'Axel',
    country: 'Mexico',
    city: 'Cuitlahuac',
    birthDate: '1993-04-10',
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    salary: 100000,
    hobby: 'sports',
    email: 'Axel93@hotmail.com',
  },
  {
    id: 2,
    firstName: 'Gonzalo',
    country: 'United Arab Emirates',
    city: 'Fujairah',
    birthDate: '1997-11-30',
    currency: 'JPY',
    preferredLanguage: 'Go',
    salary: 120000,
    hobby: 'photography',
    email: 'Gonzalo_McGlynn34@gmail.com',
  },
  {
    id: 3,
    firstName: 'Sherwood',
    country: 'Mexico',
    city: 'Tlacolula de Matamoros',

    birthDate: '1990-06-20',
    currency: 'CHF',
    preferredLanguage: 'Rust',
    salary: 99000,
    hobby: 'cooking',
    email: 'Sherwood_McLaughlin65@hotmail.com',
  },
  {
    id: 4,
    firstName: 'Alexandre',
    country: 'France',
    city: 'Persan',
    // birthDate: new Date(1990, 3, 20),
    birthDate: '1990-04-20',
    currency: 'EUR',
    preferredLanguage: 'Go',
    salary: 97000,
    hobby: 'reading',
    email: 'Alexandre_Harber@hotmail.com',
  },
  {
    id: 5,
    firstName: 'Mariane',
    country: 'United States',
    city: 'Hays',
    birthDate: '2002-04-20',
    currency: 'EUR',
    preferredLanguage: 'TypeScript',
    salary: 58000,
    hobby: 'cooking',
    email: 'Mariane0@hotmail.com',
  },
  {
    id: 6,
    firstName: 'Rosalind',
    country: 'Mexico',
    city: 'Nuevo Casas Grandes',
    birthDate: '1992-12-12',
    currency: 'AUD',
    preferredLanguage: 'JavaScript',
    salary: 198000,
    hobby: 'dancing',
    email: 'Rosalind69@gmail.com',
  },
  {
    id: 7,
    firstName: 'Lolita',
    country: 'Sweden',
    city: 'Delsbo',
    birthDate: '1990-10-05',
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    salary: 200000,
    hobby: 'cooking',
    email: 'Lolita.Hayes@hotmail.com',
  },
  {
    id: 8,
    firstName: 'Tre',
    country: 'Germany',
    city: 'Bad Camberg',
    birthDate: '1990-10-15',
    currency: 'GBP',
    preferredLanguage: 'TypeScript',
    salary: 200000,
    hobby: 'sports',
    email: 'Tre28@gmail.com',
  },
  {
    id: 9,
    firstName: 'Lurline',
    country: 'Canada',
    city: 'Raymore',
    birthDate: '1990-05-18',
    currency: 'EUR',
    preferredLanguage: 'Rust',
    salary: 58000,
    hobby: 'sports',
    email: 'Lurline_Deckow@gmail.com',
  },
];
