---
title: Grouping rows
---

You can use any field available in the `DataSource` to do the grouping - it can even be a field that is not a column.

<Note>

When using TypeScript, both `DataSource` and `InfiniteTable` components are generic and need to be rendered/instantiated with a `DATA_TYPE` parameter. The fields in that `DATA_TYPE` can then be used for grouping.

</Note>


```tsx
type Person = {
  name: string;
  age: number;
  country: string;
  id: string;
}

const groupRowsBy = [{field: 'country'}]

<DataSource<Person> groupRowsBy={groupRowsBy}>
  <InfiniteTable<Person> />
</DataSource>

```
In the example above, we're grouping by `country`, which is a field available in the `Person` type. Specifying a field not defined in the `Person` type would be a type error.

Additionally, a `column` object can be used together with the `field` to define how the group column should be rendered.

```tsx
const groupRowsBy = [
  {
    field: 'country',
    column: {
      width: 150,
      header: 'Country group',
    }
  }
]
```

The example below puts it all together.

Also see the <DataSourcePropLink name="groupRowsBy"> groupRowsBy API reference</DataSourcePropLink> to find out more.

<Sandpack title="Simple row grouping">

```ts file=row-grouping-example.page.tsx
```
```ts file=columns.ts
```
</Sandpack>

In `groupRowsBy.column` you can use any column property - so, for example, you can define a custom `renderValue` function to customize the rendering.

```tsx
const groupRowsBy = [
  {
    field: 'country',
    column: {
      renderValue: ({ value }) => <>Country: {value}</>,
    }
  }
]
```
