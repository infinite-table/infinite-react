import * as React from 'react';

import {
  DataSourceApi,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
};

const data: Developer[] = [
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

const columns: InfiniteTablePropColumns<Developer> = {
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

const currencies = ['USD', 'CAD', 'EUR', 'GBP', 'RUB', 'UAH', 'CNY'];
const stacks = ['frontend', 'backend', 'fullstack'];
const languages = [
  'JavaScript',
  'TypeScript',
  'Go',
  'Rust',
  'Python',
  'Java',
  'C#',
];
const getRandomDeveloperUpdate = (data: Developer): Partial<Developer> => ({
  id: data.id,
  age: Math.floor(Math.random() * (60 - 20 + 1)) + 20,
  canDesign: ['yes', 'no'][
    Math.floor(Math.random() * 2)
  ] as Developer['canDesign'],

  currency: currencies[Math.floor(Math.random() * currencies.length)],
  preferredLanguage: languages[Math.floor(Math.random() * languages.length)],
  stack: stacks[Math.floor(Math.random() * stacks.length)],
});

export default () => {
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<Developer>>();
  const [activeIndex, setActiveIndex] = React.useState(0);
  return (
    <>
      <button
        onClick={() => {
          const rowInfo = dataSourceApi!.getRowInfoByIndex(activeIndex);
          if (rowInfo && rowInfo.data) {
            dataSourceApi!.updateData(
              getRandomDeveloperUpdate(rowInfo.data as Developer),
            );
          }
        }}
      >
        Update current row
      </button>

      <React.StrictMode>
        <DataSource<Developer>
          data={data}
          primaryKey="id"
          onReady={setDataSourceApi}
        >
          <InfiniteTable<Developer>
            activeRowIndex={activeIndex}
            onActiveRowIndexChange={setActiveIndex}
            keyboardNavigation="row"
            columnDefaultWidth={100}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
