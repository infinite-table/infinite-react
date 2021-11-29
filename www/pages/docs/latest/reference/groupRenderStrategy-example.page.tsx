import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  DataSourcePropGroupRowsBy,
  InfiniteTableGroupColumnFunction,
  InfiniteTablePropGroupRenderStrategy,
} from '@infinite-table/infinite-react';
import { columns, Employee } from './employee-columns';

const groupRowsBy: DataSourcePropGroupRowsBy<Employee> = [
  {
    field: 'age',
  },
  {
    field: 'companyName',
  },
];

const groupColumn: InfiniteTableGroupColumnFunction<Employee> =
  //TODO continue here, make sure options contain groupRenderStrategy
  (options: {
    groupByForColumn?: { field: keyof Employee };
  }) => {
    const field = options.groupByForColumn?.field;
    const groupColumn = {
      width: field === 'age' ? 160 : 250,
      header: field === 'age' ? '🎊 Age' : '🎉 Company',
      renderValue: ({ value }: { value: any }) => {
        if (field === 'age') {
          return `Age: ${value}`;
        }

        return value;
      },
    };

    return groupColumn;
  };

const domProps = {
  style: { flex: 1 },
};

export default function App() {
  const [groupRenderStrategy, setGroupRenderStrategy] =
    React.useState<InfiniteTablePropGroupRenderStrategy>(
      'multi-column'
    );
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexFlow: 'column',
      }}>
      <p>Please select the group render strategy</p>
      <div style={{ padding: 10 }}>
        <select
          style={{
            margin: '10px 0',
            display: 'inline-block',
            background: 'var(--infinite-background)',
            color: 'var(--infinite-cell-color)',
            padding: 'var(--infinite-space-3)',
          }}
          value={groupRenderStrategy}
          onChange={(event) => {
            const groupRenderStrategy = event.target
              .value as InfiniteTablePropGroupRenderStrategy;

            setGroupRenderStrategy(groupRenderStrategy);
          }}>
          <option value="multi-column">multi-column</option>
          <option value="single-column">
            single-column
          </option>
          <option value="inline">inline</option>
        </select>
      </div>
      <DataSource<Employee>
        data={dataSource}
        primaryKey="id"
        groupRowsBy={groupRowsBy}>
        <InfiniteTable<Employee>
          domProps={domProps}
          groupRenderStrategy={groupRenderStrategy}
          groupColumn={groupColumn}
          columns={columns}
          columnDefaultWidth={150}
        />
      </DataSource>
    </div>
  );
}

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/employees1k'
  )
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};
