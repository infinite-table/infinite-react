import {
  DataSourceData,
  InfiniteTable,
  InfiniteTableColumn,
  InfiniteTablePropColumnSizing,
  InfiniteTableProps,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import * as React from 'react';
import { useState } from 'react';

import { employees } from '../group-by/employees10';

type Employee = {
  id: number;
  companyName: string;
  companySize: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  city: string;
  streetName: string;
  streetNo: number;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};

const dataSource = () => employees;
export const columns: Record<string, InfiniteTableColumn<Employee>> = {
  id: { field: 'id' },
  country: {
    field: 'country',
    type: 'country',
    defaultWidth: 300,
  },
  city: { field: 'city' },
  team: { field: 'team' },
  salary: { field: 'salary', type: 'empty' },
  age: {
    field: 'age',
    header: 'the age field',
  },
};

const defaultColumnSizing: InfiniteTablePropColumnSizing = {
  age: {
    width: 800,
  },
  salary: {
    width: 145,
  },
};

const domProps: InfiniteTableProps<Employee>['domProps'] = {
  style: {
    margin: '5px',
    height: '90vh',
    width: '95vw',
    border: '1px solid gray',
    position: 'relative',
  },
};

function App() {
  const [currentData] = React.useState<DataSourceData<Employee>>(dataSource);

  const [autoSizeId, setRefreshId] = useState(0);

  const [columnSizing, setColumnSizing] =
    useState<InfiniteTablePropColumnSizing>(defaultColumnSizing);
  const autoSizeValue = (globalThis as any).autoSize;

  return (
    <React.StrictMode>
      <button
        onClick={() => {
          setRefreshId((id) => id + 1);
        }}
      >
        auto size
      </button>
      <DataSource<Employee> primaryKey="id" data={currentData}>
        <InfiniteTable<Employee>
          domProps={domProps}
          virtualizeColumns={false}
          columnSizing={columnSizing}
          onColumnSizingChange={setColumnSizing}
          columnMinWidth={50}
          columns={columns}
          columnDefaultWidth={200}
          autoSizeColumnsKey={
            autoSizeId
              ? typeof (autoSizeValue === 'number')
                ? autoSizeValue
                : {
                    key: autoSizeId,

                    ...(autoSizeValue || {}),
                  }
              : undefined
          }
        />
      </DataSource>
    </React.StrictMode>
  );
}

export default App;
