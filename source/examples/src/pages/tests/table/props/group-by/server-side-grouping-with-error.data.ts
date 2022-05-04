import { DataSourceData } from '@infinite-table/infinite-react/components/DataSource/types';

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

export const data = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    country: 'USA',
    city: 'New York',
    currency: '$',
    preferredLanguage: 'JavaScript',
    stack: 'React, Redux, Node.js',
    canDesign: 'yes',
    hobby: 'Coding',
    salary: 50000,
    age: 30,
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Doe',
    country: 'USA',
    city: 'San Francisco',
    currency: '$',
    preferredLanguage: 'PHP',
    stack: 'Laravel, Mongodb',
    canDesign: 'yes',
    hobby: 'Photography',
    salary: 60000,
    age: 35,
  },
  {
    id: 3,
    firstName: 'Bob',
    lastName: 'Dobson',
    country: 'Canada',
    city: 'Toronto',
    currency: '$',
    preferredLanguage: 'Ruby',
    stack: 'Ruby, Rails',
    canDesign: 'no',
    hobby: 'Coding',
    salary: 40000,
    age: 28,
  },
  {
    id: 4,
    firstName: 'Jill',
    lastName: 'Brownson',
    country: 'France',
    city: 'Paris',
    currency: '€',
    preferredLanguage: 'JavaScript',
    stack: 'Angular, Node.js',
    canDesign: 'no',
    hobby: 'Coding',
    salary: 30000,
    age: 32,
  },
] as Developer[];

function getDataSource(cached: boolean) {
  const dataSource: DataSourceData<Developer> = ({
    groupBy,
    groupKeys = [],
  }) => {
    if (groupKeys.length === 0) {
      return Promise.resolve({
        cache: cached,
        data: [
          {
            data: { country: 'USA' },
            keys: ['USA'],
          },
          {
            data: { country: 'Canada - will error on expand' },
            keys: ['Canada'],
          },
          {
            data: { country: 'France' },
            keys: ['France'],
          },
        ],
        totalCount: 3,
      });
    }

    if (groupKeys.length === 1 && groupKeys[0] === 'USA') {
      return Promise.resolve({
        cache: cached,
        data: [
          {
            data: { country: 'USA', city: 'New York' },
            keys: ['USA', 'New York'],
          },
          {
            data: { country: 'USA', city: 'San Francisco' },
            keys: ['USA', 'San Francisco'],
          },
        ],
        totalCount: 2,
      });
    }

    if (groupKeys.length === 1 && groupKeys[0] === 'Canada') {
      return Promise.resolve({
        data: [],
        cache: cached,
        error: 'Cannot load children for Canada',
      });
    }

    return Promise.resolve({
      cache: cached,
      data: [],
      totalCount: 0,
    });
  };

  return dataSource;
}

export const cachedDataSource = getDataSource(true);
export const uncachedDataSource = getDataSource(false);
