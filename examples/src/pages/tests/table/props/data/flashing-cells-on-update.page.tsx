import * as React from 'react';

import {
  DataSourceApi,
  InfiniteTable,
  InfiniteTablePropColumns,
  DataSource,
  createFlashingColumnCellComponent,
} from '@infinite-table/infinite-react';
import { useState } from 'react';

const FlashingColumnCell = createFlashingColumnCellComponent({
  // flashDuration: 1500,
  // fadeDuration: 1000,
  // flashClassName: 'fade-red',
  // fadeClassName: 'red',
  render: ({ children, oldValue }) => {
    return (
      <>
        {children}---{oldValue}
      </>
    );
  },
});

type Developer = {
  id: number;
  firstName: string;
  monthlyBonus: number;
  salary: number;
  reposCount: number;
  stack: string;
  currency: string;
};
const dataSource: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    monthlyBonus: 1000,
    salary: 1000,
    reposCount: 10,
    stack: 'React',
    currency: 'USD',
  },
  {
    id: 2,
    firstName: 'Jane',
    monthlyBonus: 1000,
    salary: 1000,
    reposCount: 10,
    stack: 'React',
    currency: 'USD',
  },
];

const salaryValues = [dataSource[0].salary];
(globalThis as any).salaryValues = salaryValues;

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
    components: {
      ColumnCell: FlashingColumnCell,
    },
  },

  salary: {
    field: 'salary',
    type: 'number',
    defaultWidth: 400,
    components: {
      ColumnCell: FlashingColumnCell,
    },
  },
};

const domProps = {
  style: {
    height: '100%',
  },
};
export default () => {
  const [dataSourceApi, setDataSourceApi] =
    useState<DataSourceApi<Developer>>();

  return (
    <>
      <React.StrictMode>
        <button
          onClick={() => {
            if (!dataSourceApi) {
              return;
            }
            const randomSalary = Math.floor(Math.random() * 10001); // Generate random int from 0 to 10000

            salaryValues.push(randomSalary);
            dataSourceApi.updateData({ id: 2, salary: randomSalary });
          }}
        >
          update salary
        </button>
        <button
          onClick={() => {
            if (!dataSourceApi) {
              return;
            }
            const randomFirstName = Math.random().toString(36).substring(2, 15);

            dataSourceApi.updateData({ id: 2, firstName: randomFirstName });
          }}
        >
          update first name
        </button>
        <DataSource<Developer>
          data={dataSource}
          onReady={setDataSourceApi}
          primaryKey="id"
          defaultCellSelection={{
            defaultSelection: false,
            selectedCells: [],
          }}
        >
          <InfiniteTable<Developer>
            domProps={domProps}
            columnMinWidth={50}
            columns={columns}
            columnDefaultEditable
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
