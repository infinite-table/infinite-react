---
title: Working with Data
description: Learn how to visualise and manage your data in new ways with Infinite Table
vue: true
angular: true
---

When working with data, you will mostly interact with the `<DataSource />` component, which is responsible for handling and managing the data and passing it down to the `<InfiniteTable />` component, which is the rendering engine for the DataGrid.

So we provide those two components (as named exports) inside `@infinite-table/infinite-react` package:

- `<DataSource />` - our data-handling component
- `<InfiniteTable />` - our virtualized component

The `<DataSource/>` component is responsible for the data the management layer.

<Note>

Probably the most important prop for the `<DataSource />` component is the <DPropLink name="primaryKey" /> prop. It specifies the property of the data object that is used as a unique identifier for data rows/items.

```tsx file="index.snippet.tsx" region="intro"
```

</Note>

<FrameworkContent framework="react">

The `<DataSource />` is a generic React TypeScript component that can be bound to an array of items of the generic type.

<Note>

In this documentation, we'll use `DATA_TYPE` when referring to the generic type. Rarely, we'll use `T`.

```tsx file="index.snippet.tsx" region="generic-type"
```

Most of our examples in these docs have a `Developer` or `Employee` TypeScript data type used as the generic type for the `<DataSource />` component.

</Note>

</FrameworkContent>

<FrameworkContent framework="vue">

The `<DataSource />` component is bound to an array of items. In a Vue template the component takes no type parameter - when using TypeScript, the types of the props are generic, so you type the values you bind with them: `DataSourceData<DATA_TYPE>` for the `data` prop, `InfiniteTablePropColumns<DATA_TYPE>` for the columns.

<Note>

In this documentation, we'll use `DATA_TYPE` when referring to the generic type. Rarely, we'll use `T`.

```tsx file="index.snippet.tsx" region="generic-type"
```

Most of our examples in these docs have a `Developer` or `Employee` TypeScript data type used as the generic type.

</Note>

</FrameworkContent>

<FrameworkContent framework="angular">

The `DataSource` component (`<infinite-data-source>`) is a generic class, bound to an array of items of the generic type. In a template you don't pass the type: with `strictTemplates`, Angular infers it from the inputs you bind, so type the values you bind with it: `DataSourceData<DATA_TYPE>` for the `data` input, `InfiniteTablePropColumns<DATA_TYPE>` for the columns.

<Note>

In this documentation, we'll use `DATA_TYPE` when referring to the generic type. Rarely, we'll use `T`.

```tsx file="index.snippet.tsx" region="generic-type"
```

Most of our examples in these docs have a `Developer` or `Employee` TypeScript data type used as the generic type.

</Note>

</FrameworkContent>

```tsx file="index.snippet.tsx" region="local-data"
```

In the snippet above, we see 3 important details:

<FrameworkContent framework="react">

1. the component is bound to the `Employee` type
2. we use a `primaryKey` property - here it is `id`, but since the bound type is `Employee`, `primaryKey` is `keyof Employee`
3. we pass the `employees` array as the `data` property.

</FrameworkContent>

<FrameworkContent framework="vue">

1. the `employees` array is typed as `Employee[]`
2. we use a `primaryKey` property - here it is `id`, which is a property of the `Employee` type
3. we pass the `employees` array as the `data` property, bound with `:data`.

</FrameworkContent>

<FrameworkContent framework="angular">

1. the `employees` array is typed as `Employee[]`, and the type of the `DataSource` is inferred from it
2. we use a `primaryKey` input - here it is `id`, which is a property of the `Employee` type
3. we pass the `employees` array as the `data` input, bound with `[data]`.

</FrameworkContent>

<Note>

The <DataSourcePropLink name="data" /> prop can be either:

- an array of the bound generic type - here `Employee[]`
- a Promise tha resolves to an array like the above
- a function that returns any of the above

</Note>

```tsx file="basic-example.demo.tsx" title="Data loading example with promise"
```


## Data Loading Strategies

We're aware there are countless strategies for loading data - each with its own strengths. We decided we should focus on building what we do best, namely building virtualized components, so we encourage you to use your preferred data-fetching library/solution. This being said, we still provide you with the flexibility you need when using the `<DataSource/>`, so here's what you can use for the <DPropLink name="data" /> prop of the component:

- an array of the bound type
- a Promise that resolves to an array of the bound type
- a function that returns any of the above

While you're loading the data, you can always render a loading indicator - pass the <DataSourcePropLink name="loading" /> prop into the component (along with <PropLink name="loadingText" /> prop in the `<InfiniteTable />` component if you want to customize the message).

### Using fetch

For basic datasets, which have simple data requirements, using `fetch` is probably sufficient, so here is an example:

```tsx file="using-fetch-example.demo.tsx" title="Using fetch for remote data"
```

#### Re-fetching on change

It's important to note you can re-fetch data by changing the reference you pass as the `data` prop to the `<DataSource/>` component.

<Note>

Passing another <DPropLink name="data"/> function, will cause the component to re-execute the function and thus load new data.

Alternatively, you can use the <DPropLink name="refetchKey" /> prop to trigger a re-fetch - give it a new value (eg: use it as a counter, and increment it) and the component will re-fetch the data.

</Note>

```tsx file="refetch-example.demo.tsx" title="Re-fetching data"
```

## Live Updates

You can update your data in real-time by using our [DataSource API](/docs/reference/datasource-api).

<HeroCards>
<YouWillLearnCard title="DataSource API" path="/docs/learn/working-with-data/updating-data-in-realtime">
Read more about how to use our API to update your data in real-time
</YouWillLearnCard>

</HeroCards>
