import {
  DataSourceData,
  DataSourceDataParams,
  InfiniteTable,
  InfiniteTableColumn,
  InfiniteTablePropColumnSizing,
  InfiniteTablePropColumnTypes,
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
  id: { field: 'id', defaultWidth: 500 },
  country: {
    field: 'country',
    type: 'country',
    defaultWidth: 300,
  },
  city: { field: 'city' },
  team: { field: 'team' },
  department: { field: 'department' },
  firstName: { field: 'firstName', defaultWidth: 777, type: 'empty' },
  lastName: { field: 'lastName' },
  salary: { field: 'salary', type: 'empty', defaultWidth: 555 },
  age: {
    field: 'age',
    type: 'custom-number',
    defaultWidth: 110,
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

const columnTypes: InfiniteTablePropColumnTypes<Employee> = {
  'custom-number': {
    align: 'end',
    defaultWidth: 200,
  },
  country: {
    // minWidth: 450,
  },
  empty: {},
  default: {
    defaultWidth: 234,
    align: 'center',
    renderValue: ({ value }) => <>{value}!!!</>,
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
  const onDataChange = React.useCallback(
    (dataInfo: DataSourceDataParams<Employee>) => {
      console.log(dataInfo);
    },
    [],
  );

  const [currentData] = React.useState<DataSourceData<Employee>>(dataSource);

  const columnOrder = React.useMemo(() => {
    return ['id', 'age', 'country'];
  }, []);

  const [autoSizeId, setRefreshId] = useState(0);

  const [columnSizing, setColumnSizing] =
    useState<InfiniteTablePropColumnSizing>(defaultColumnSizing);

  return (
    <React.StrictMode>
      <button
        onClick={() => {
          setRefreshId((id) => id + 1);
        }}
      >
        auto size
      </button>
      <DataSource<Employee>
        primaryKey="id"
        data={currentData}
        onDataParamsChange={onDataChange}
      >
        <InfiniteTable<Employee>
          domProps={domProps}
          columnOrder={columnOrder}
          virtualizeColumns={false}
          columnTypes={columnTypes}
          columnSizing={columnSizing}
          onColumnSizingChange={(columnSizing) => {
            // console.log({ columnSizing }, '!!!');
            setColumnSizing(columnSizing);
          }}
          columnMinWidth={50}
          columns={columns}
          autoSizeColumnsKey={{
            key: autoSizeId,
            columnsToSkip: ['id'],
            includeHeader: true,
          }}
        />
      </DataSource>
    </React.StrictMode>
  );
}

export default App;
