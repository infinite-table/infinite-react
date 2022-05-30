import {
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
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

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

export default function LocalUncontrolledSingleSortingExample() {
  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        defaultSortInfo={{
          field: 'salary',
          dir: 1,
        }}>
        <InfiniteTable<Developer>
          columns={columns}
          columnDefaultWidth={220}
        />
      </DataSource>
    </>
  );
}

const dataSource: Developer[] = [
  {
    id: 0,

    firstName: 'Nya',
    lastName: 'Klein',
    country: 'India',
    city: 'Unnao',
    age: 24,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'yes',
    salary: 60000,
    hobby: 'sports',
    email: 'Nya44@gmail.com',
  },
  {
    id: 1,
    firstName: 'Axel',
    lastName: 'Runolfsson',
    country: 'Mexico',
    city: 'Cuitlahuac',
    age: 46,
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'no',
    salary: 100000,
    hobby: 'sports',
    email: 'Axel93@hotmail.com',
  },
  {
    id: 2,
    firstName: 'Gonzalo',
    lastName: 'McGlynn',
    country: 'United Arab Emirates',
    city: 'Fujairah',
    age: 54,
    currency: 'JPY',
    preferredLanguage: 'Go',
    stack: 'frontend',
    canDesign: 'yes',
    salary: 120000,
    hobby: 'photography',
    email: 'Gonzalo_McGlynn34@gmail.com',
  },
  {
    id: 3,
    firstName: 'Sherwood',
    lastName: 'McLaughlin',
    country: 'Mexico',
    city: 'Tlacolula de Matamoros',
    age: 43,
    currency: 'CHF',
    preferredLanguage: 'Rust',
    stack: 'backend',
    canDesign: 'no',
    salary: 99000,
    hobby: 'cooking',
    email: 'Sherwood_McLaughlin65@hotmail.com',
  },
  {
    id: 4,
    firstName: 'Alexandre',
    lastName: 'Harber',
    country: 'France',
    city: 'Persan',
    age: 23,
    currency: 'EUR',
    preferredLanguage: 'Go',
    stack: 'backend',
    canDesign: 'yes',
    salary: 97000,
    hobby: 'reading',
    email: 'Alexandre_Harber@hotmail.com',
  },
  {
    id: 5,

    firstName: 'Mariane',
    lastName: 'Schroeder',
    country: 'United States',
    city: 'Hays',
    age: 34,
    currency: 'EUR',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'no',
    salary: 58000,
    hobby: 'cooking',
    email: 'Mariane0@hotmail.com',
  },
  {
    id: 6,
    firstName: 'Rosalind',
    lastName: 'Mills',
    country: 'Mexico',
    city: 'Nuevo Casas Grandes',
    age: 33,
    currency: 'AUD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
    canDesign: 'no',
    salary: 198000,
    hobby: 'dancing',
    email: 'Rosalind69@gmail.com',
  },
  {
    id: 7,
    firstName: 'Lolita',
    lastName: 'Hayes',
    country: 'Sweden',
    city: 'Delsbo',
    age: 22,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    stack: 'full-stack',
    canDesign: 'yes',
    salary: 200000,
    hobby: 'cooking',
    email: 'Lolita.Hayes@hotmail.com',
  },
  {
    id: 8,
    firstName: 'Tre',
    lastName: 'Boyle',
    country: 'Germany',
    city: 'Bad Camberg',
    age: 11,
    currency: 'GBP',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'yes',
    salary: 200000,
    hobby: 'sports',
    email: 'Tre28@gmail.com',
  },
  {
    id: 9,
    firstName: 'Lurline',
    lastName: 'Deckow',
    country: 'Canada',
    city: 'Raymore',
    age: 31,
    currency: 'EUR',
    preferredLanguage: 'Rust',
    stack: 'frontend',
    canDesign: 'yes',
    salary: 58000,
    hobby: 'sports',
    email: 'Lurline_Deckow@gmail.com',
  },
];
