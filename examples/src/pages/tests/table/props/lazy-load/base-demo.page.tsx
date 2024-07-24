import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  InfiniteTablePropColumns,
  GroupRowsState,
  DataSourceGroupBy,
} from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  stack: string;
};

const data: any = [
  {
    data: { country: 'USA' },
    keys: ['USA'],
    totalChildrenCount: 2,
  },
  {
    data: { country: 'Germany' },
    keys: ['Germany'],
    totalChildrenCount: 2,
  },
];

const dataPerKey: Record<string, any> = {
  USA: [
    {
      data: { stack: 'frontend', country: 'USA' },
      keys: ['USA', 'frontend'],
      totalChildrenCount: 2,
      children: [
        { id: 1, firstName: 'John', country: 'USA', stack: 'frontend' },
        { id: 2, firstName: 'Marry', country: 'USA', stack: 'frontend' },
      ],
    },
    {
      data: { stack: 'backend', country: 'USA' },
      keys: ['USA', 'backend'],
      totalChildrenCount: 2,
    },
    {
      data: { stack: 'fullstack', country: 'USA' },
      keys: ['USA', 'fullstack'],
    },
  ],
  'USA,frontend': [
    { id: 1, firstName: 'John', country: 'USA', stack: 'frontend' },
    { id: 2, firstName: 'Marry', country: 'USA', stack: 'frontend' },
  ],
  'USA,backend': [
    { id: 3, firstName: 'Bob', country: 'USA', stack: 'backend' },
    { id: 4, firstName: 'Bill', country: 'USA', stack: 'backend' },
    { id: 5, firstName: 'James', country: 'USA', stack: 'backend' },
  ],
};

const columns: InfiniteTablePropColumns<Developer> = {
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

export default function BaseExample() {
  const groupBy: DataSourceGroupBy<Developer>[] = React.useMemo(
    () => [
      {
        field: 'country',
      },

      { field: 'stack' },
    ],
    [],
  );

  return (
    <DataSource<Developer>
      primaryKey="id"
      data={dataSource}
      groupBy={groupBy}
      defaultGroupRowsState={groupRowsState}
      lazyLoad={true}
    >
      <InfiniteTable<Developer>
        domProps={{
          style: {
            height: '80vh',
          },
        }}
        scrollStopDelay={10}
        columns={columns}
        columnDefaultWidth={220}
      />
    </DataSource>
  );
}

const dataSource: DataSourceData<Developer> = ({ groupKeys }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (groupKeys?.length) {
        const data = dataPerKey[groupKeys.join(',')];

        if (data) {
          resolve({
            data,
            totalCount: data.length,
          });
          return;
        }
      }
      resolve({
        data,
        totalCount: data.length,
      });
    }, 100);
  });
};
