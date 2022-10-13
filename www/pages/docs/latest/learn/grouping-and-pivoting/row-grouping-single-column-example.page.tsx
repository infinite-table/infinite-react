import {
  InfiniteTable,
  DataSource,
  DataSourcePropGroupBy,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { columns, Employee } from './columns';

const groupBy: DataSourcePropGroupBy<Employee> = [
  {
    field: 'age',
  },
  {
    field: 'companyName',
  },
];

const groupColumn: InfiniteTableColumn<Employee> = {
  header: 'Grouping',
  defaultWidth: 250,
  // in this function we have access to collapsed info
  // and grouping info about the current row - see rowInfo.groupBy
  renderGroupValue: ({ value, rowInfo }) => {
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
    <DataSource<Employee> data={dataSource} primaryKey="id" groupBy={groupBy}>
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
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees10k')
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};
