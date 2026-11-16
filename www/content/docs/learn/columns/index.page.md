---
title: Working with Columns
description: Define columns to configure your Infinite Table React DataGrid - fixed and flexible columns, resize, column groups and more
---

Columns are a central feature in `InfiniteTable`.

You define columns as a an object, with keys being column ids while values are the column definitions.

You then use them in the `columns` prop in your `InfiniteTable` component.

The <PropLink name="columns" /> prop is typed either as

- `Record<string, InfiniteTableColumn<DATA_TYPE>>`
- or `InfiniteTablePropColumns<DATA_TYPE>`, which is an alias for the type above

<Note title="Understanding column id">

In `InfiniteTable`, columns are identified by their key in the <PropLink name="columns" /> object. **We'll refer to this as the column id**.
The column ids are used in many places - like defining the <PropLink name="columnOrder" code={false}>column order</PropLink>, column pinning, column visibility, etc.

</Note>

```ts file="index.snippet.tsx" region="intro"
```

<Note>

It's very important to remember you should not pass a different reference of a prop on each render. `<InfiniteTable />` is a optimized to only re-render when props change - so if you change the props on every re-render you will get a performance penalty.

You should use `React.useCallback` / `React.useMemo` / `React.useState` to make sure you only update the props you pass down to `InfiniteTable` when you have to.

</Note>

```tsx file="basic-columns-example.demo.tsx" title="Basic Column Configuration"
```

<YouWillLearnCard inline title="Learn more about customizing Column Rendering" path="./columns/column-rendering">
Find out how to render custom content inside columns or even take full control of column cells and header.
</YouWillLearnCard>

## Column Types

Column types allow you to customize column behavior and appearance for multiple columns at once. Most of the properties available for columns are also available for column types - for a full list, see <PropLink>columnTypes</PropLink> reference.

There are two special <PropLink code={false} name="columns.type">column types</PropLink> for now, but more are coming soon:

- `default` - all columns have this type, if not otherwise specified. The type does not contain any configuration, but allows you to define it and apply common configuration to all columns.
- `number` - if specified on a column (in combination with local uncontrolled sorting), the column will be sorted numerically.

<YouWillLearnCard inline title="Learn more on Column Types" path="./columns/column-types">
Find out how to use column types to customize the appearance and behaviour of your columns.
</YouWillLearnCard>

## Column Order

The implicit column order is the order in which columns have been defined in the <PropLink name="columns" /> object. You can however control that explicitly by using the `columnOrder: string[]` prop.

```tsx file="index.snippet.tsx" region="column-order"
```

The <PropLink name="columnOrder" /> prop is an array of strings, representing the column ids. A column id is the key of the column in the <PropLink name="columns" /> object.

<Note>

The <PropLink name="columnOrder" /> array can contain identifiers that are not yet defined in the <PropLink name="columns" /> Map, or can contain duplicate ids. This is a feature, not a bug. We want to allow you to use the <PropLink name="columnOrder" /> in a flexible way so it can define the order of current and future columns.

</Note>

<Note>
<PropLink name="columnOrder" /> is a controlled prop. For the uncontrolled version, see <PropLink name="defaultColumnOrder" />

When using controlled <PropLink name="columnOrder" />, make sure you also update the order by using the <PropLink name="onColumnOrderChange" /> callback prop.
</Note>

```tsx file="/docs/reference/columnOrder-example.demo.tsx" title="Column Order demo, with firstName col displayed twice"
```

<Note>

By keeping the column order simple, namely an array of strings, ordering becomes much easier.

The alternative would be to make `columns` an array, which most DataGrids do - and whenever they are reordered, a new `columns` array would be needed.

</Note>
