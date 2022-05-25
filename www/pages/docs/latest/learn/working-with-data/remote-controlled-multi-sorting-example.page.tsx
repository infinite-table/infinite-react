import {
  InfiniteTable,
  DataSource,
  DataSourceData,
  DataSourcePropSortInfo,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource: DataSourceData<Developer> = ({ sortInfo }) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }
  const args = [
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(sortInfo.map((s) => ({ field: s.field, dir: s.dir })))
      : null,
  ]
    .filter(Boolean)
    .join('&');

  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + `/developers100-sql?` + args,
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
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

const domProps = { style: { height: '90vh' } };

export default function RemoteControlledMultiSortingExample() {
  const [sortInfo, setSortInfo] = React.useState<
    DataSourcePropSortInfo<Developer>
  >([
    {
      field: 'salary',
      dir: -1,
    },
  ]);
  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        sortInfo={sortInfo}
        sortMode="remote"
        onSortInfoChange={setSortInfo}
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
          columnDefaultWidth={220}
        />
      </DataSource>
    </>
  );
}
