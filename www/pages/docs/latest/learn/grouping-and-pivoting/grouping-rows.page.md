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

## Grouping strategies

When you want to group by multiple fields, `InfiniteTable` offers multiple grouping strategies:
 * multi column mode - the default.
 * single column mode
 * inline mode

You can specify the rendering strategy by setting the <PropLink name="groupRenderStrategy" /> property to any of the following: `multi-column`, `single-column` or `inline`.


### Multiple groups columns

When grouping by multiple fields, by default the component will render a group column for each group field

```tsx
const groupRowsBy = [
  {
    field: 'age',
    column: {
      width: 100,      
      renderValue: ({ value }) => <>Age: {value}</>,
    }
  },
  {
    field: 'companyName'
  },
  {
    field: 'country'
  }
]
```

Let's see an example of how the component would render the table with the multi-column strategy.

<Sandpack title="Multi-column group render strategy">

```ts file=row-grouping-multi-column-example.page.tsx
```
```ts file=columns.ts
```

</Sandpack>


### Single group column

You can group by multiple fields, yet only render a single group column. To choose this rendering strategy, specify <PropLink name="groupRenderStrategy" /> property to be `single-column`.

In this case, you can't override the group column for each group field, as there's only one group column being generated. However, you can specify a <PropLink name="groupColumn" /> property to customize the generated column.
 
<Sandpack title="Single-column group render strategy">

```ts file=row-grouping-single-column-example.page.tsx
```
```ts file=columns.ts
```

</Sandpack>

<Note>

If <PropLink name="groupColumn" /> is specified to an object and no <PropLink name="groupRenderStrategy" /> is passed, the render strategy will be `single-column`.

<PropLink name="groupColumn" /> can also be a function, which allows you to individually customize each group column - in case the `multi-column` strategy is used.

</Note>