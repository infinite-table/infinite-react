---
title: Extending existing filters
description: Learn how to extend existing filters and filter types for your Infinite Table React DataGrid
---

By default `InfiniteTable` has the following default filter types:

- `string`
- `number`

and each of them has a collection of operators that are supported - see <DPropLink name="filterTypes" /> for the respective list of supported operators.

You may find those operators limiting - but it's easy to extend them and add new operators or even new filter types.

## Adding new operators to existing filter types

You can import `defaultFilterTypes` from the root of the package.

```ts file="extending-existing-filters.snippet.tsx" region="adding-a-new-operator-to-the-string-filter-type" title="Adding a new operator to the string filter type"
```

<Note>

When you import the named `defaultFilterTypes` value and extend it, that will affect all `InfiniteTable` components in your application.

If you don't want that, you need to use the `filterTypes` prop of the `<DataSource />` component. Either build an entirely new object for `filterTypes`, or start by cloning `defaultFilterTypes` and extend it.

</Note>

<DemoDescription>

The `string` columns have a new `Not includes` operator.

</DemoDescription>

```tsx file="customised-default-filter-types-example.demo.tsx" title="Enhanced string filter type - new 'Not includes' operator"
```

## Adding new filter types

If the existing filter types are not enough, it's easy to add new ones.

As already mentioned, you can either update the value of `defaultFilterTypes` or use the `filterTypes` prop of the `<DataSource />` component. Updating the value `defaultFilterTypes` will affect all your `InfiniteTable` DataGrid components.

```ts file="extending-existing-filters.adding-a-new-filter-type-by-updating.snippet.tsx" region="adding-a-new-filter-type-by-updating" title="Adding a new filter type by updating defaultFilterTypes"
```

```ts file="extending-existing-filters.snippet.tsx" region="adding-a-new-filter-type-by-using-the" title="Adding a new filter type by using the filterTypes prop"
```

<Note>

When passing `filterTypes` to the `<DataSource />` component, the object will be merged with the `defaultFilterTypes`. As a result, the existing `string` and `number` filterTypes will be preserved, unless explicitly overridden.

</Note>

<DemoTitle>Writing a `bool` filter type with a custom filter editor</DemoTitle>
<DemoDescription>

The `canDesign` column is using a custom `bool` filter type with a custom filter editor.

</DemoDescription>

```tsx file="checkbox-filter-editor-example.demo.tsx"
```
