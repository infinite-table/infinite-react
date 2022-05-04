import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  GroupRowsState,
  DataSourceGroupBy,
  InfiniteTablePropGroupColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';
import { useMemo } from 'react';

import {
  cachedDataSource,
  Developer,
} from './server-side-grouping-with-error.data';

const domProps = {
  style: {
    height: '80vh',
  },
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  age: { field: 'age' },

  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

export default function SSGroupingWithError() {
  const groupBy: DataSourceGroupBy<Developer>[] = React.useMemo(
    () => [
      {
        field: 'country',
      },
      {
        field: 'city',
      },
    ],
    [],
  );

  const groupColumn: InfiniteTablePropGroupColumn<Developer> = useMemo(() => {
    return {
      renderValue: ({ rowInfo }) => {
        if (!rowInfo.isGroupRow) {
          return rowInfo.value;
        }
        return rowInfo.error ?? rowInfo.value;
      },
    };
  }, []);

  return (
    <DataSource<Developer>
      primaryKey="id"
      data={cachedDataSource}
      groupBy={groupBy}
      defaultGroupRowsState={groupRowsState}
      lazyLoad={true}
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        groupColumn={groupColumn}
        columns={columns}
        groupRenderStrategy="single-column"
        columnDefaultWidth={220}
      />
    </DataSource>
  );
}
