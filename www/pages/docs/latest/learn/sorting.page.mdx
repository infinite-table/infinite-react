## Sorting

Sorting is done by the `DataSource` component which controls the `data` of the virtualized infinite table. For specifying a default sort, you can use the uncontrolled `defaultSortInfo` prop.

Sorting can be **single** or **multiple** - meaning it can operate on a single field in the datasource or on multiple fields. For single sorting, the `defaultSortInfo` (or controlled `sortInfo`) props should be an object (or null or undefined),

```tsx title=uncontrolled-single-sorting
const defaultSortInfo = { dir: 1, field: "NameOfFieldYouWantToSortBy" };
<DataSource<T> defaultSortInfo={defaultSortInfo} />;
```

while for multiple sorting, you need to specify an array.

```tsx title=uncontrolled-multiple-sorting
const defaultSortInfo = [
  { dir: 1, field: "NameOfFieldYouWantToSortBy" },
  { dir: -1, field: "SecondField" },
];
<DataSource<T> defaultSortInfo={defaultSortInfo} />;
```

### Sorting columns

However, for changing the sorting via user interaction, it's enough to click on column headers in the table. By default, `InfiniteTable` is `sortable=true` and columns are also `sortable=true`.
Specifying `sortable` on column level overrides the grid property.

```tsx height=450 live title=multi-sort-example
import * as React from "react";
import {
  InfiniteTable,
  DataSource,
  DataSourceSortInfo,
  InfiniteTableColumn,
} from "@infinite-table/infinite-react";

type Person = {
  Id: number;
  FirstName: string;
  Age: number;
};

const data: Person[] = [
  {
    Id: 1,
    FirstName: "Bob",
    Age: 18,
  },
  {
    Id: 2,
    FirstName: "Alice",
    Age: 20,
  },
  {
    Id: 3,
    FirstName: "Bill",
    Age: 20,
  },
  {
    Id: 4,
    FirstName: "Zeneth",
    Age: 20,
  },
  {
    Id: 5,
    FirstName: "Robert",
    Age: 29,
  },
];

const columns: Map<string, InfiniteTableColumn<Person>> = new Map([
  [
    "id",
    {
      // specifies which field from the data source
      // should be rendered in this column
      field: "Id",
      type: "number",
      sortable: true,
      width: 100,
    },
  ],
  [
    "firstName",
    {
      field: "FirstName",
    },
  ],
  ["age", { field: "Age", type: "number" }],
]);

const defaultSortInfo: DataSourceSortInfo<Person> = [
  { field: "Age", dir: 1 },
  { field: "FirstName", dir: -1 },
];

function App() {
  return (
    <DataSource<Person>
      data={data}
      primaryKey="Id"
      defaultSortInfo={defaultSortInfo}
    >
      <InfiniteTable<Person> columnDefaultWidth={200} columns={columns} />
    </DataSource>
  );
}

render(<App />);
```
