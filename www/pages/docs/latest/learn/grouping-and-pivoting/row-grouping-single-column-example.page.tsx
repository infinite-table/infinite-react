import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  DataSourcePropGroupBy,
  InfiniteTableColumnRenderValueParam,
} from '@infinite-table/infinite-react';
import { columns, Employee } from './columns';

const groupBy: DataSourcePropGroupBy<Employee> = [
  {
    field: 'age',
  },
  {
    field: 'companyName',
  },
];

const groupColumn = {
  header: 'Grouping',
  width: 250,
  // in this function we have access to collapsed info
  // and grouping info about the current row - see rowInfo.groupBy
  renderValue: ({
    value,
    rowInfo,
  }: InfiniteTableColumnRenderValueParam<Employee>) => {
    const groupBy = rowInfo.groupBy || [];
    const collapsed = rowInfo.collapsed;
    const groupField = groupBy[groupBy.length - 1];

    if (groupField === 'age') {
      return `🥳 ${value}${collapsed ? ' 🤷‍♂️' : ''}`;
    }

    return `🎉 ${value}`;
  },
};

export default function App() {
  return (
    <DataSource<Employee>
      data={dataSource}
      primaryKey="id"
      groupBy={groupBy}>
      <InfiniteTable<Employee>
        groupRenderStrategy="single-column"
        groupColumn={groupColumn}
        columns={columns}
        columnDefaultWidth={150}
      />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/employees10k'
  )
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};
