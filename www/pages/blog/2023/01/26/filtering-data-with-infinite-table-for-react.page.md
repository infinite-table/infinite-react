---
title: "Filtering Data with Infinite Table for React"
description: "Learn how to filter data both client-side and server-side with Infinite Table for React"
author: [admin]
---

*Today we shipped cutting-edge column filtering functionality, that enables intuitive client-side and server-side filtering*

<Note title="Why use Infinite Table filters?">

1️⃣ Narrow down your data with your own filter types and operators

2️⃣ Works both client-side and server-side

3️⃣ Easy customization of filters and filter editors

4️⃣ Optimized for performance

5️⃣ Easy to use across multiple columns

</Note>

Filters were, by far, the most requested feature to add to Infinite Table after our initial launch. 

The recently-released version `1.1.0` of Infinite Table for React introduces support for column filters, which work both client-side and server-side.

In order to enable filtering - specify the <DPropLink name="defaultFilterValue"/> property on the `<DataSource />` component, as shown below:

```tsx {4} title="Enabling_filters_on_the_DataSource"
<DataSource<Developer>
  data={/* ... */}
  primaryKey="id"
  defaultFilterValue={[]}
>
  <InfiniteTable<Developer>
    columns={columns}
  />
</DataSource>
```

This configures the `<DataSource />` component with an empty array of filters; columns will pick this up and each will display a filter editor in the column header.

Of course, you can define some initial filters:

```tsx title="Initial_filters:_filter_by_age_greater_than_40"
defaultFilterValue={[
  {
    field: 'age',
    filter: {
      type: 'number',
      operator: 'gt',
      value: 40
    } 
  }
]}
```
You can see how all of this looks like when we put it all together in the examples below.

## Local and Remote Filtering


Because the `<DataSource />` <DPropLink name="data" /> prop is a function that returns a `Promise` with remote data, the filtering will happen server-side by default.

<CSEmbed title="Server-side filtering 10k records" id="infinite-table-with-remote-filters-i8b4wx" />

When using remote filtering, it's your responsability to send the DataSource <DPropLink name="filterValue"/> to the backend (you get this object as a parameter in your <DPropLink name="data"/> function). This value includes for each column the value in the filter editor, the column filter type and the operator in use. In this case, the frontend and the backend need to agree on the operator names and what each one means.


<Note title="Data reloads when filters change">

Whenever filters change, when remote filtering is configured, the <DPropLink name="data" /> function prop is called again, with an object that has the `filterValue` correctly set to the current filters (together with `sortInfo` and other data-related props like `groupBy`, etc).
</Note>

However, we can use the <DPropLink name="filterMode"/> to force client-side filtering:

```tsx
<DataSource<Developer>
  filterMode="local"
  filterDelay={0}
/>
```
We also specify the <DPropLink name="filterDelay">filterDelay=0</DPropLink> in order to perform filtering immediately, without debouncing and batching filter changes, for a quicker response ⚡️ 🏎

<CSEmbed title="Client-side filtering 10k records" id="infinite-table-with-client-side-filters-sqbdbu" />


<Note title="Using local filtering">

Even if your data is loaded from a remote source, using `filterMode="local"` will perform all filtering on the client-side - so you don't need to send the `filterValue` to the server in your `data` function.

</Note>

## Defining Filter Types and Custom Filter Editors

Currently there are 2 filter types available in Infinite Table:

 - `string`
 - `number`

Conceptually, you can think of filter types similar to data types - generally if two columns will have the same data type, they will display the same filter.

Each filter type supports a number of operators and each operator has a name and can define it's own filtering function, which will be used when local filtering is used.

<CSEmbed title="Custom filter type and filter editor for canDesign column" id="infinite-table-filters-with-custom-editor-and-filter-type-ptlq2v"/>


The example above, besides showing how to define <DPropLink name="filterTypes" code={false}>a custom filter type</DPropLink>, also shows how to define a custom filter editor.


<Note title="Providing a Custom Filter Editor">

For defining a custom filter editor to be used in a filter type, we need to write a new React component that uses the <HookLink name="useInfiniteColumnFilterEditor" /> hook.

```tsx

import { useInfiniteColumnFilterEditor } from '@infinite-table/infinite-react'

export function BoolFilterEditor() {
  const { value, setValue } = useInfiniteColumnFilterEditor<Developer>();
  return <>
    {/* ... */}
  </>
}
```

This custom hook allows you to get the current `value` of the filter and also to retrieve the `setValue` function that we need to call when we want to update filtering.

Read more about this [in the docs - how to provide a custom editor](/docs/learn/filtering/providing-a-custom-filter-editor).

</Note>

## Customise Filterable Columns and Filter Icons

Maybe you don't want all your columns to be filterable.

For controlling which columns are filterable and which are not, use the <PropLink name="columns.defaultFilterable" /> property.

This overrides the global <PropLink name="columnDefaultFilterable" /> prop.

We have also made it easy for you to customize the filter icon that is displayed in the column header.


<CSEmbed title="Custom filter icons for firstName and salary columns" id="infinite-table-custom-filter-icon-jc7jr8" />

You change the filter icon by using the <PropLink name="columns.renderFilterIcon" /> prop - for full control, it's being called even when the column is not filtered, but you have a `filtered` property on the argument the function is called with.

In the example above, the `salary` column is configured to render no filter icon, but the `header` is customized to be bolded when the column is filtered.

## Ready for Your Challenge!

We listened to your requests for advanced filtering.

And we believe that we've come up with something that's really powerful and customizable.

Now it's your turn to try it out and show us what you can build with it! 🚀

If you have any questions, feel free to reach out to us on [Twitter](https://twitter.com/infinite_table) or in the [GitHub Discussions](https://github.com/infinite-table/infinite-react/discussions).

Make sure you try out filtering in Infinite Table for yourself ([and consult our extensive docs](/docs/learn/filtering) if required).

<HeroCards>
<YouWillLearnCard title="Client-side filtering" path="/docs/learn/filtering/filtering-client-side">
Learn how to use filtering in the browser.
</YouWillLearnCard>
<YouWillLearnCard title="Server-side filtering" path="/docs/learn/filtering/filtering-server-side">
Figure out how to use filtering with server-side integration.
</YouWillLearnCard>
</HeroCards>

