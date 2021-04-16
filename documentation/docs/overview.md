---
id: overview
title: Overview
sidebar_label: Overview
---

This is a general overview of the **InfiniteTable** and the core concepts you have to understand before using the talbe.

InfiniteTable comes with full TypeScript support in order to make you more productive while using the table.

We took a revolutionary approach when designing the API for the table and we've carefully considered various options to in order to help you be more productive.

## Defining columns

Columns, along with the data source, are probably the most important concept for the table.

```tsx
/**
 * Let's assume we want to display a list of employees,
 * with their first and last names
 */

import { DataSource, TableFactory } from "@infinite-table/react-table";
import type { TableColumn } from "@infinite-table/react-table";

import "@infinite-table/react-table/index.css";

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
};

// we're ready to define columns
const columns = new Map<string, TableColumn<Employee>>();

// the key in the columns map will be used as the column id
columns.set("first", { field: "firstName" });
columns.set("last", { field: "lastName" });

// and add some data
const data: Employee[] = [
  { id: 1, firstName: "John", lastName: "Bobson" },
  { id: 2, firstName: "Mary", lastName: "Richardson" },
];

const Table = TableFactory<Employee>();

const domProps = {
  style: { height: "50vh", border: "1px solid gray" },
};

const App = () => {
  return (
    <DataSource<Employee> primaryKey="id" data={data}>
      <Table domProps={domProps} columns={columns} columnMinWidth={100} />
    </DataSource>
  );
};
```

Unlike other tables, which have an array of columns, we preferred using a `Map` for the table columns.

Every `column` in the collection can contain multiple properties, but the single most important property is the `field`, it tells which (obviously) **`field`** from the **data source** will be displayed in the given column.

The `field` property on columns is not mandatory - you can use the column `render({ value, column, data })` property to render custom `React` nodes.

Either `field` or `render` are required on every column.

### Uniquely identifying columns

A `column` is referenced in other parts of the table by its respective key in the `columns` map.

```tsx
const columns = new Map<string, TableColumn<Employee>([
  ['id',    { field: 'id'}],
  ['first', { field: 'firstName'}],
  ['age',   { field: 'age'}]
])

<Table columns={columns} columnOrder={['id','first']}>
```

### TypeScript

We're leveraging the full power of TypeScript and its type system, including extensive use of generic types in order to help you be more productive in the long run.

For example, the table `columns` map need to specify the underlying type of the data they use - `new Map<string,TableColumn<YOUR_DATA_TYPE>>()`.

The same goes with the `TableFactory` you need to use to get a reference to the `Table` function component you need to render the table - you specify the data type on which the `Table` will operate:

```tsx
import { TableFactory } from "@use-infinite-table/react-table";

const Table = TableFactory<DATA_TYPE>();

// you you're ready to render
<Table columns={...} />;
```

## Using a data-source

The table needs to be wrapped in a `DataSource` component (at any level of nesting), as demonstrated in the first example above. The `DataSource` needs to specify which is the `primaryKey` for the data - this is crucial for table performance.

There are a couple of ways in which the data source can be specified:

- an array
- a promise resolving to an array
- a function returning any of the above

For the most basic setup, use an array to get started

```jsx
import { DataSource } from '@infinite-table/react-table';
import '@infinite-table/react-table/index.css';

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
};

// an array data-source, with properties matching the _field_ specified in the columns
const data: Employee[] = [
  {id: 'jbobson', firstName: 'John', lastName: 'Bobson' },
  {id: 'mrichardson', firstName: 'Mary', lastName: 'Richardson' },
]

<DataSource<Employee>
  data={data}
  primaryKey="id"
>
```

**NOTE**: In order to perform well, **the InfiniteTable DataSource needs a `primaryKey`** to be present on each item in the data-source (it doesn't necessarily need to have a corresponding column).
