import type { CarSale } from '@examples/datasets/CarSale';
import type { InfiniteTableColumn } from '@infinite-table/infinite-react';

export type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  age: number;
};

export const insertData: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    age: 20,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Hapson',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

export const insertDataColumns: Record<string, InfiniteTableColumn<Developer>> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
  },
  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

export const mark: Developer = {
  id: 6,
  firstName: 'Mark',
  lastName: 'Berg',
  age: 39,
  canDesign: 'no',
  currency: 'USD',
  preferredLanguage: 'Go',
  stack: 'frontend',
};

export const afterMark: Developer = {
  id: 7,
  firstName: 'After Mark',
  lastName: 'After',
  age: 39,
  canDesign: 'no',
  currency: 'USD',
  preferredLanguage: 'Go',
  stack: 'frontend',
};

export const developersData5: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    age: 20,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    age: 25,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    age: 30,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

export const carsales: CarSale[] = [
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 2WD',
    year: 2010,
    sales: 15,
    color: 'red',
    id: 0,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2007,
    sales: 1,
    color: 'red',
    id: 1,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2008,
    sales: 2,
    color: 'magenta',
    id: 2,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2009,
    sales: 136,
    color: 'blue',
    id: 3,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2010,
    color: 'blue',
    sales: 30,
    id: 4,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'TSX',
    year: 2009,
    sales: 14,
    color: 'yellow',
    id: 5,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'TSX',
    year: 2010,
    sales: 14,
    color: 'red',
    id: 6,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Audi',
    model: 'A3',
    year: 2009,
    sales: 2,
    color: 'magenta',
    id: 7,
  },
];

(globalThis as any).carsales = carsales;

export const carSaleBasicColumns: Record<string, InfiniteTableColumn<CarSale>> = {
  make: { field: 'make' },
  model: { field: 'model' },
  category: {
    field: 'category',
  },
  count: {
    field: 'sales',
  },
  year: {
    field: 'year',
    type: 'number',
  },
};

export const height100DomProps = {
  style: {
    height: '100%',
  },
};
