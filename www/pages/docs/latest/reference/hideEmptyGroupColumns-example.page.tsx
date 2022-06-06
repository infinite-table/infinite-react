import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  DataSourcePropGroupBy,
  InfiniteTablePropGroupRenderStrategy,
  GroupRowsState,
} from '@infinite-table/infinite-react';
import { columns, Employee } from './employee-columns';

const groupBy: DataSourcePropGroupBy<Employee> = [
  {
    field: 'department',
  },
  {
    field: 'companyName',
  },
];

const domProps = {
  style: { flex: 1 },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

export default function App() {
  const [groupRenderStrategy, setGroupRenderStrategy] =
    React.useState<InfiniteTablePropGroupRenderStrategy>(
      'multi-column'
    );

  const [hideEmptyGroupColumns, setHideEmptyGroupColumns] =
    React.useState(true);
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        color: 'var(--infinite-cell-color)',
        flexFlow: 'column',
        background: 'var(--infinite-background)',
      }}>
      <div style={{ padding: 10 }}>
        <label>
          <input
            type="checkbox"
            checked={hideEmptyGroupColumns}
            onChange={() => {
              setHideEmptyGroupColumns(
                !hideEmptyGroupColumns
              );
            }}
          />
          Hide Empty Group Columns (make sure all
          `Department` groups are collapsed to see it in
          action)
        </label>
      </div>
      <DataSource<Employee>
        data={dataSource}
        primaryKey="id"
        defaultGroupRowsState={groupRowsState}
        groupBy={groupBy}>
        <InfiniteTable<Employee>
          domProps={domProps}
          hideEmptyGroupColumns={hideEmptyGroupColumns}
          groupRenderStrategy={'multi-column'}
          columns={columns}
          columnDefaultWidth={250}
        />
      </DataSource>
    </div>
  );
}

const dataSource = () => {
  return fetch(
    'https://infinite-table.com/.netlify/functions/json-server' +
      '/employees10'
  )
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};
