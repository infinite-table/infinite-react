import * as React from 'react';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSourceGroupBy,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import { HTMLProps, useState } from 'react';

interface Person {
  Id: number;
  FirstName: string;
  LastName: string;
  Address: string;
  Age: number;
}

const data = [
  {
    Id: 20,
    FirstName: 'Bob',
    LastName: 'Bobson',
    Address: 'United States, Nashvile 8, rue due Secour',
    Age: 3,
  },
  {
    Id: 3,
    FirstName: 'Alice',
    LastName: 'Aliceson',
    Address: 'United States, San Francisco 5',
    Age: 50,
  },
  {
    Id: 10,
    FirstName: 'Bill',
    LastName: 'Billson',
    Address: 'France, Paris, Sur seine',
    Age: 50,
  },
];

const ageColumn: InfiniteTableColumn<Person> = {
  field: 'Age',
  type: 'number',
};

const getColumns = () => {
  const columns: Record<string, InfiniteTableColumn<Person>> = {
    Age: ageColumn,
    Id: { field: 'Id', type: 'number', defaultSortable: true },
    FirstName: {
      field: 'FirstName',
      header: 'First name',
    },
    LastName: {
      field: 'LastName',
      header: 'Last name',
    },
    Address: {
      field: 'Address',
    },
  };

  return columns;
};

const domProps: HTMLProps<HTMLDivElement> = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative',
  },
};

const groupBy: DataSourceGroupBy<Person>[] = [
  {
    field: 'Age',
    column: {
      header: 'test',
      // rowspan: ({ enhancedData }) => {
      //   if (enhancedData.isGroupRow && !enhancedData.collapsed) {
      //     return enhancedData.groupCount! + 1;
      //   }
      //   return 1;
      // },
      // rowspan: ({ enhancedData }) => {
      //   if (enhancedData.indexInGroup === 0) {
      //     console.log(
      //       'groupcount',
      //       enhancedData.groupCount,
      //       enhancedData.indexInAll,
      //     );
      //     return enhancedData.groupCount!;
      //   }
      //   return 1;
      // },
      // renderValue: ({ enhancedData }) => {
      //   if (enhancedData.indexInGroup === 0) {
      //     return enhancedData.groupKeys?.join('-');
      //   }
      //   return 'x';
      // },
    },
  },
  {
    field: 'FirstName',
  },
];
export default () => {
  const columns = ((globalThis as any).getColumns || getColumns)();

  const [count, setCount] = useState(0);
  return (
    <React.StrictMode>
      <DataSource<Person> data={data} primaryKey="Id" groupBy={groupBy}>
        <button
          onClick={() => {
            setCount((c) => c + 1);
          }}
        >
          UPDATE - {count}
        </button>
        <InfiniteTable<Person> domProps={domProps} columns={columns} />
      </DataSource>
    </React.StrictMode>
  );
};
