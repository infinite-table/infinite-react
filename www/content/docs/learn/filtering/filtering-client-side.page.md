---
title: Client-side Filtering
description: Learn how to configure client-side filtering for your Infinite Table React DataGrid
---

The most common way to use filtering in Infinite Table is by configuring filters for columns (this works both for client-side and server-side filtering).

Filtering happens client-side by default - whether the DataSource <DPropLink name="data" /> property is an array, a `Promise` or a function. The only exceptions are <DPropLink name="lazyLoad" /> and <DPropLink name="livePagination" />, which filter server-side by default.

<Note>

When the <DPropLink name="data" /> property is a function, it's not called again when the filters change. If you also want to reload the data on every filter change, and then filter it client-side, set <DPropLink name="shouldReloadData.filterValue">shouldReloadData.filterValue: true</DPropLink> together with `filterFunction={defaultFilterFunction}`.

</Note>

## Showing the Column Filters

In order to show the column filter editors in the column headers, you need to specify either the uncontrolled <DPropLink name="defaultFilterValue" /> property or the controlled <DPropLink name="filterValue" /> version.

<DemoTitle>Client-side filtering in action</DemoTitle>
<DemoDescription>

This example shows remote data with local filtering - the data function is called once, and the filtering happens in the browser.

In addition, the `filterDelay` property is set to `0` for instant feedback.

</DemoDescription>

```tsx file="basic-local-filter-example.demo.tsx"
```

<Note>

If you still want filtering to be enabled with the default functionality of using the <DPropLink name="filterValue" /> (or uncontrolled <DPropLink name="defaultFilterValue" />), but want to hide the column filter editors, you can set the <DPropLink name="showColumnFilters">showColumnFilters</DPropLink> property to `false`.

</Note>

## Using Filter Types

As already documented in the [Understanding Filter Types](./#understanding-filter-types) section, you can specify the types of the filters the `<DataSource />` will support, by using the <DPropLink name="filterTypes" /> property.

The default filter types are `string` and `number` - read the next section to see how you can add new operators to those filter types.

A filter type is basically a collection of operators available for a type of data. Each operator needs a name and a function that will be used to filter the data, when that operator is applied.

```tsx file="filtering-client-side.snippet.tsx" region="using-filter-types-for-filtervalue" title="Using_filter_types_for_filterValue"
```

The above filter value specifies that there are 2 filters applied:

- the `firstName` column applies a filter that will only match rows with `firstName` containining the string `John`
- the `age` column has an additional filter, that will only match rows with `age` greater than `30`

When filtering client-side, the rows are filtered using the functions of the `includes` operator in the `string` filter type and of the `gt` operator in the `number` filter type.

Here's a snippet of code from the `string` filter type showing the `includes` operator:

```tsx file="filtering-client-side.snippet.tsx" region="using-filter-types"
```

Let's now look at another example, of implementing a custom `salary` filter type.

For this, we override the `filterTypes` property of the `<DataSource />` component:

```tsx file="filtering-client-side.snippet.tsx" region="salary-filter-type"
```

<Note>

When you specify new <DPropLink name="filterTypes"/>, the default filter types of `string` and `number` are still available - unless the new object contains those keys and overrides them explicitly.

</Note>

<DemoTitle>Client-side filtering in action with custom filter type</DemoTitle>
<DemoDescription>

The `salary` column has a custom filter type, with the following operators: `gt`, `gte`, `lt` and `lte`.

</DemoDescription>

```tsx file="filter-custom-filter-type-example.demo.tsx"
```

### Customizing Default Filter Types

By default, the `string` and `number` filter types are available. You can import the default filter types like this:

```ts file="filtering-client-side.snippet.tsx" region="customizing-default-filter-types"
```

If you want to make all your instances of `InfiniteTable` have new operators for those filter types, you can simply mutate the exported `defaultFilterTypes` object.

<DemoTitle>Enhanced string filter type - new 'Not includes' operator</DemoTitle>
<DemoDescription>

The `string` columns have a new `Not includes` operator.

</DemoDescription>

```tsx file="customised-default-filter-types-example.demo.tsx"
```

<Note>

When you specify new <DPropLink name="filterTypes"/>, the default filter types of `string` and `number` are still available - unless the new object contains those keys and override them explicitly.

</Note>

## Using a Filter Delay

In order to save some resources, filtering is batched by default. This is controlled by the <DPropLink name="filterDelay"/> prop, which, if not specified, defaults to `200` milliseconds. This means, any changes to the column filters, that happen inside a 200ms window (or the current value of <DPropLink name="filterDelay"/>), will be debounced and only the last value will be used to trigger a filter.

<Note>

If you want to prevent debouncing/batching filter values, you can set <DPropLink name="filterDelay"/> to `0`.

</Note>

<Note>

API calls to <ApiLink name="setColumnFilter"/> or <ApiLink name="clearColumnFilter"/> are not batched.

</Note>

## Using a Filter Function Instead of the Column Filters

With a <DPropLink name="filterFunction" />, you decide how the rows are filtered client-side. It is called for every row, and the param it receives also has the current column filters (`filterValue` and `filterTypes`), so you can filter in any way you want:

- call `defaultFilterFunction`, which Infinite Table exports, to filter by the column filters the same way the built-in filtering does;
- write your own logic;
- or combine the two.

```tsx file="filtering-client-side.snippet.tsx" region="using-a-filter-function-instead-of-the-column"
```

<DemoTitle>Custom filterFunction example</DemoTitle>
<DemoDescription>

Loads data from remote location but will only show rows that have `id > 100`.

</DemoDescription>

```tsx file="filter-function-example.demo.tsx"
```
