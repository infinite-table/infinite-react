---
title: Working with Data
description: Learn how to visualise and manage your data in new ways with Infinite Table
---

When working with data, you will mostly interact with the `<DataSource />` component, which is responsible for handling and managing the data and passing it down to the `<InfiniteTable />` component, which is the rendering engine for the DataGrid.

So we provide those two components (as named exports) inside `@infinite-table/infinite-react` package:

- `<DataSource />` - our data-handling component
- `<InfiniteTable />` - our virtualized component

The `<DataSource/>` component is responsible for the data the management layer.

<Note>

Probably the most important prop for the `<DataSource />` component is the <DPropLink name="idProperty" /> prop. It specifies the property of the data object that is used as a unique identifier for data rows/items.

```tsx
<DataSource<DATA_TYPE>
  idProperty="id"
  data={[]} // or a Promise or function returning a Promise.
/>
```

</Note>

The `<DataSource />` is a generic React TypeScript component that can be bound to an array of items of the generic type.

<Note>

In this documentation, we'll use `DATA_TYPE` when referring to the generic type. Rarely, we'll use `T`.

```tsx
<DataSource<DATA_TYPE>>
  <InfiniteTable<DATA_TYPE> />
</DataSource>
```

Most of our examples in these docs have a `Developer` or `Employee` TypeScript data type used as the generic type for the `<DataSource />` component.

</Note>

```tsx
import { DataSource } from '@infinite-table/infinite-react';

type Employee = {
  id: string | number;
  name: string;
  salary: number;
  department: string;
  company: string;
};

const employees: Employee[] = [
  { id: 1, name: 'Bob', salary: 10_000, department: 'IT', company: 'Bobsons' },
  {
    id: 2,
    name: 'Alice',
    salary: 20_000,
    department: 'IT',
    company: 'Bobsons',
  },
  { id: 3, name: 'John', salary: 30_000, department: 'IT', company: 'Bobsons' },
];

<DataSource<Employee> primaryKey={'id'} data={employees} />;
```

In the snippet above, we see 3 important details:

1. the component is bound to the `Employee` type
2. we use a `primaryKey` property - here it is `id`, but since the bound type is `Employee`, `primaryKey` is `keyof Employee`
3. we pass the `employees` array as the `data` property.

<Note>

The <DataSourcePropLink name="data" /> prop can be either:

- an array of the bound generic type - here `Employee[]`
- a Promise tha resolves to an array like the above
- a function that returns any of the above

</Note>

<Sandpack title="Data loading example with promise">

```ts file="basic-example.page.tsx"

```

</Sandpack>

## Data Loading Strategies

We're aware there are countless strategies for loading data - each with its own strengths. We decided we should focus on building what we do best, namely building virtualized components, so we encourage you to use your preferred data-fetching library/solution. This being said, we still provide you with the flexibility you need when using the `<DataSource/>`, so here's what you can use for the <DPropLink name="data" /> prop of the component:

- an array of the bound type
- a Promise that resolves to an array of the bound type
- a function that returns any of the above

While you're loading the data, you can always render a loading indicator - pass the <DataSourcePropLink name="loading" /> prop into the component (along with <PropLink name="loadingText" /> prop in the `<InfiniteTable />` component if you want to customize the message).

### Using fetch

For basic datasets, which have simple data requirements, using `fetch` is probably sufficient, so here is an example:

<Sandpack title="Using fetch for remote data">

```ts file="using-fetch-example.page.tsx"

```

```ts file="columns.ts"

```

</Sandpack>

#### Re-fetching on change

It's important to note you can re-fetch data by changing the reference you pass as the `data` prop to the `<DataSource/>` component.

<Note>

Passing another <DPropLink name="data"/> function, will cause the component to re-execute the function and thus load new data.

Alternatively, you can use the <DPropLink name="refetchKey" /> prop to trigger a re-fetch - give it a new value (eg: use it as a counter, and increment it) and the component will re-fetch the data.

</Note>

<Sandpack title="Re-fetching data">

```ts file="refetch-example.page.tsx"

```

```ts file="columns.ts"

```

</Sandpack>

## Live Updates

You can update your data in real-time by using our [DataSource API](/docs/reference/datasource-api).

<HeroCards>
<YouWillLearnCard title="DataSource API" path="/docs/learn/working-with-data/updating-data-in-realtime">
Read more about how to use our API to update your data in real-time
</YouWillLearnCard>

</HeroCards>
