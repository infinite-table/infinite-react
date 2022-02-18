import * as React from 'react';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourceGroupBy,
  InfiniteTableGroupColumnFunction,
} from '@infinite-table/infinite-react';

import { employees } from './employees10';
import { useMemo, useState } from 'react';

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

const dataSource = () => {
  return Promise.resolve(employees);
};

const columns: Record<string, InfiniteTableColumn<Employee>> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
  },
  country: {
    field: 'country',
    header: 'Country',
  },
  department: {
    field: 'department',
    header: 'Department',
  },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const domProps: React.HTMLProps<HTMLDivElement> = {
  style: {
    margin: '5px',
    height: 900,
    border: '1px solid gray',
    position: 'relative',
  },
};

const groupColumnFn: InfiniteTableGroupColumnFunction<Employee> = (options) => {
  const { groupByForColumn } = options;

  return {
    id: 'g-for-' + groupByForColumn?.field,
    header: `G for ${groupByForColumn?.field}`,
  };
};

export default function GroupByExample() {
  const [customGroupColumnId, setCustomGroupColumnId] = useState(false);

  const groupBy = useMemo<DataSourceGroupBy<Employee>[]>(
    () => [
      {
        field: 'department',
      },
      {
        field: 'country',
        column: customGroupColumnId
          ? { id: 'custom-country', header: 'custom-country' }
          : undefined,
      },
    ],
    [customGroupColumnId],
  );
  const [hideEmptyGroupColumns, setHideEmptyGroupColumns] = useState(true);
  return (
    <React.StrictMode>
      <button
        onClick={() => {
          setCustomGroupColumnId((value) => !value);
        }}
      >
        use custom group column id
      </button>
      <label
        onChange={() => {
          setHideEmptyGroupColumns(!hideEmptyGroupColumns);
        }}
      >
        Hide empty group columns
        <input type="checkbox" checked={hideEmptyGroupColumns} />
      </label>
      <DataSource<Employee>
        data={dataSource}
        primaryKey="id"
        groupBy={groupBy}
        defaultGroupRowsState={groupRowsState}
      >
        <InfiniteTable<Employee>
          domProps={domProps}
          groupColumn={groupColumnFn}
          hideEmptyGroupColumns={hideEmptyGroupColumns}
          columnDefaultWidth={200}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}
