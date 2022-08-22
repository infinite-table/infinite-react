---
title: Working with Data
---

We've decoupled our data handling from our rendering engine by providing two components (as named exports) inside `@infinite-table/infinite-react` package:

* `<DataSource />` - our data-handling component
* `<InfiniteTable />` - our virtualized component

The `<DataSource/>` component is responsible for the data the management layer. It is a generic TypeScript component that can be bound to an array of items of the generic type.

```tsx
import { DataSource } from '@infinite-table/infinite-react';

type Employee = {
  id: string | number;
  name: string;
  salary: number;
  department: string;
  company: string;
}

const employees: Employee[] = [
  {id: 1, name: 'Bob', salary: 10_000, department: 'IT', company: 'Bobsons'},
  {id: 2, name: 'Alice', salary: 20_000, department: 'IT', company: 'Bobsons'},
  {id: 3, name: 'John', salary: 30_000, department: 'IT', company: 'Bobsons'}
];

<DataSource<Employee> primaryKey={"id"} data={employees} />
```

In the snippet above, we see 3 important details:
 * the component is bound to the `Employee` type
 * we use a `primaryKey` property - here it is `id`, but since the bound type is `Employee`, `primaryKey` is `keyof Employee`
 * we pass the `employees` array as the `data` property.

The <DataSourcePropLink name="data" /> prop is probably the most important part, and it can be one of:

 * an array of the bound type - here `Employee[]`
 * a Promise tha resolves to an array like the above
 * a function that returns an any of the above


<Sandpack title="Data loading example with promise">

```ts file=basic-example.page.tsx
```
</Sandpack>

## Data Loading Strategies

We're aware there are countless strategies for loading data - each with its own strengths. So we decided we should focus on building what we do best, namely building virtualized components.

So we encourage you to use your preferred data-fetching library/solution and pass a dumb array of data to the `<DataSource/>` component. And while you're loading the data, you can always render a loading indicator - pass the <DataSourcePropLink name="loading" /> prop into the component (along with <PropLink name="loadingText" /> prop in the `<InfiniteTable />` component if you want to customize the message).

#### Using fetch

For basic datasets, which have simple data requirements, using `fetch` is probably enough, so here's an example:

<Sandpack title="Using fetch for remote data"> 

```ts file=using-fetch-example.page.tsx
```
```ts file=columns.ts
```

</Sandpack>

#### Refetching on change

<Note>

It's important to note you can re-fetch data by changing the reference you pass as the `data` prop to the `<DataSource/>` component. Passing another `data` function, will cause the component to re-execute the function and thus load new data.

</Note>

<Sandpack title="Re-fetching data"> 

```ts file=refetch-example.page.tsx
```
```ts file=columns.ts
```

</Sandpack>

## Live Updates

We'll come up with a more suitable API for updating only specific cells/rows in the table component.