import {
  DataSource,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { employees } from '../props/group-by/employees10';

type Employee = {
  id: number;
  firstName: string;
  country: string;
  department: string;
  age: number;
};

const columns: InfiniteTablePropColumns<Employee> = {
  firstName: { field: 'firstName', header: 'First Name' },
  country: { field: 'country', header: 'Country' },
  department: { field: 'department', header: 'Department' },
  age: { field: 'age', type: 'number', header: 'Age' },
};

type Density = '' | 'compact' | 'comfortable' | 'spacious';

const densityCls = (density: Density) =>
  density ? `infinite-density--${density}` : '';

(globalThis as any).rowHeightChanges = [];
const onRowHeightChange = (rowHeight: number) => {
  (globalThis as any).rowHeightChanges.push(rowHeight);
};

export default function App() {
  const [wrapperDensity, setWrapperDensity] = React.useState<Density>('');
  const [gridDensity, setGridDensity] = React.useState<Density>('');

  return (
    <div>
      <div>
        <button
          data-name="wrapper-compact"
          onClick={() => setWrapperDensity('compact')}
        >
          wrapper: compact
        </button>
        <button
          data-name="wrapper-spacious"
          onClick={() => setWrapperDensity('spacious')}
        >
          wrapper: spacious
        </button>
        <button
          data-name="grid-spacious"
          onClick={() => setGridDensity('spacious')}
        >
          grid: spacious
        </button>
        <button
          data-name="grid-comfortable"
          onClick={() => setGridDensity('comfortable')}
        >
          grid: comfortable
        </button>
        <button
          data-name="reset"
          onClick={() => {
            setWrapperDensity('');
            setGridDensity('');
          }}
        >
          reset
        </button>
      </div>
      <div id="wrapper" className={densityCls(wrapperDensity)}>
        <div id="default-grid">
          <DataSource<Employee> data={employees as Employee[]} primaryKey="id">
            <InfiniteTable<Employee>
              domProps={{
                className: densityCls(gridDensity),
                style: { height: '400px' },
              }}
              onRowHeightChange={onRowHeightChange}
              columns={columns}
            />
          </DataSource>
        </div>
        <div id="explicit-grid">
          <DataSource<Employee> data={employees as Employee[]} primaryKey="id">
            <InfiniteTable<Employee>
              domProps={{ style: { height: '300px' } }}
              rowHeight={30}
              columnHeaderHeight={50}
              columns={columns}
            />
          </DataSource>
        </div>
      </div>
    </div>
  );
}
