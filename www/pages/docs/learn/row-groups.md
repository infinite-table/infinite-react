---
title: Row groups
---

## Row groups

Specify row groups via the controlled `groupBy` (or uncontrolled `defaultGroupBy`) prop on the `DataSource`.

```tsx file="defining-grouping"
const groupBy = [{ field: 'country' }, { field: 'city' }];
```

## Row groups in action

```tsx height=750 live title=Row-groups
import * as React from 'react';
import { useState } from 'react';
import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
  InfiniteTablePropGroupRenderStrategy,
  DataSourceGroupBy,
} from '@infinite-table/infinite-react';

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
  streetNo: string;
  department: string;
  team: string;
  salary: number;
  age: number;
  email: string;
};

const columns = new Map<string, InfiniteTableColumn<Employee>>([
  [
    'firstName',
    {
      field: 'firstName',
      header: 'First Name',
    },
  ],
  [
    'country',
    {
      field: 'country',
      header: 'Country',
      columnGroup: 'location',
    },
  ],

  [
    'city',
    {
      field: 'city',
      header: 'City',
      columnGroup: 'address',
    },
  ],
  [
    'age',
    {
      field: 'age',
      type: 'number',
      header: 'Age',
    },
  ],
  [
    'department',
    {
      field: 'department',
      header: 'Department',
    },
  ],
  [
    'team',
    {
      width: 200,
      field: 'team',
      header: 'Team',
    },
  ],
  ['company', { field: 'companyName', header: 'Company' }],
  ['companySize', { field: 'companySize', header: 'Company Size' }],
]);

declare var fetch: any;
declare var env: { BASE_URL: string };

console.log(env.BASE_URL, '!!!!');
const dataSource = () => {
  return fetch(env.BASE_URL + '/employees100')
    .then((r) => r.json())
    .then((data: Employee[]) => {
      return data;
    });
};

const defaultGroupBy: DataSourceGroupBy<Employee>[] = [
  { field: 'department' },
  // you can specify a column config for this group.
  { field: 'team', column: { header: 'What team?' } },
];
const multiSort = [];

const groupColumnDefaults = {
  sortable: false,
  width: 200,
  // we can use a custom `renderValue` function on group columns, to render a custom value
  renderValue: ({ value }) => <>{value} 📢</>,
};
function App() {
  const [groupRenderStrategy, setGroupRenderStrategy] =
    useState<InfiniteTablePropGroupRenderStrategy>('multi-column');

  return (
    <>
      <div>
        <b>Please select group render strategy:</b>

        <select
          value={groupRenderStrategy}
          onChange={(e: any) => {
            const { value } = e.target;
            setGroupRenderStrategy(value);
          }}
        >
          <option value="single-column">Single column</option>
          <option value="multi-column">Multi column</option>
        </select>
      </div>

      <DataSource<Employee>
        data={dataSource}
        primaryKey="id"
        defaultSortInfo={multiSort}
        defaultGroupBy={defaultGroupBy}
      >
        <InfiniteTable<Employee>
          columnDefaultWidth={130}
          groupRenderStrategy={groupRenderStrategy}
          groupColumn={groupColumnDefaults}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </>
  );
}

render(<App />);
```
