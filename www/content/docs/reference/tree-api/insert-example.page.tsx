import * as React from 'react';

import {
  DataSourceApi,
  InfiniteTable,
  InfiniteTableApi,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  salary: number;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
  reposCount: number;
};

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const CURRENCIES = ['USD', 'CAD', 'EUR'];
const stacks = ['frontend', 'backend', 'fullstack'];

let ID = 0;

const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Mike', 'Molly'];
const lastNames = ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones'];
const getRow = (count?: number): Developer => {
  return {
    id: ID++,
    firstName:
      ID === 1
        ? 'ROCKY'
        : firstNames[getRandomInt(0, firstNames.length - 1)] +
          (count ? ` ${count}` : ''),
    lastName: lastNames[getRandomInt(0, firstNames.length - 1)],

    currency: CURRENCIES[getRandomInt(0, 2)],
    salary: getRandomInt(1000, 10000),
    preferredLanguage: 'JavaScript',
    stack: stacks[getRandomInt(0, 2)],
    canDesign: getRandomInt(0, 1) === 0 ? 'yes' : 'no',
    age: getRandomInt(20, 100),
    reposCount: getRandomInt(0, 100),
  };
};

const dataSource: Developer[] = [...Array(10)].map(getRow);

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
    style: ({ value, rowInfo }) => {
      if (rowInfo.isGroupRow) {
        return {};
      }

      return {
        color: 'black',
        background:
          value > 80
            ? 'tomato'
            : value > 60
            ? 'orange'
            : value > 40
            ? 'yellow'
            : value > 20
            ? 'lightgreen'
            : 'green',
      };
    },
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  reposCount: {
    field: 'reposCount',
    type: 'number',
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

const domProps = {
  style: {
    height: '100%',
  },
};

const buttonStyle = {
  border: '2px solid magenta',
  color: 'var(--infinite-cell-color)',
  background: 'var(--infinite-background)',
};
export default () => {
  const [apis, onReady] = React.useState<{
    api: InfiniteTableApi<Developer>;
    dataSourceApi: DataSourceApi<Developer>;
  }>();

  const [currentActivePrimaryKey, setCurrentActivePrimaryKey] =
    React.useState<string>('');

  return (
    <React.StrictMode>
      <button
        style={buttonStyle}
        onClick={() => {
          if (apis) {
            const dataSourceApi = apis.dataSourceApi!;
            dataSourceApi.insertData(
              getRow(dataSourceApi.getRowInfoArray().length),
              {
                primaryKey: 0,
                position: 'after',
              },
            );
          }
        }}
      >
        Add row after Rocky
      </button>
      <button
        style={buttonStyle}
        disabled={!currentActivePrimaryKey}
        onClick={() => {
          if (apis) {
            const dataSourceApi = apis.dataSourceApi!;
            dataSourceApi.insertData(
              getRow(dataSourceApi.getRowInfoArray().length),
              {
                primaryKey: currentActivePrimaryKey,
                position: 'after',
              },
            );
          }
        }}
      >
        Add row after currently active row
      </button>
      <DataSource<Developer> data={dataSource} primaryKey="id">
        <InfiniteTable<Developer>
          domProps={domProps}
          onReady={onReady}
          columnDefaultWidth={130}
          columnMinWidth={50}
          columns={columns}
          keyboardNavigation="row"
          onActiveRowIndexChange={(rowIndex) => {
            const id = apis?.dataSourceApi.getRowInfoArray()[rowIndex].id;

            setCurrentActivePrimaryKey(id);
          }}
        />
      </DataSource>
    </React.StrictMode>
  );
};
