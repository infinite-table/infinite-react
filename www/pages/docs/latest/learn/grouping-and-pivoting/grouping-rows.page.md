---
title: Grouping rows
---

You can use any `field` available in the `DataSource` to do the grouping - it can even be a `field` that is not a column.

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

const groupBy = [{field: 'country'}]

<DataSource<Person> groupBy={groupBy}>
  <InfiniteTable<Person> />
</DataSource>

```
In the example above, we're grouping by `country`, which is a field available in the `Person` type. Specifying a field not defined in the `Person` type would be a type error.

Additionally, a `column` object can be used together with the `field` to define how the group column should be rendered.

```tsx
const groupBy = [
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

Also see the <DataSourcePropLink name="groupBy"> groupBy API reference</DataSourcePropLink> to find out more.

<Sandpack title="Simple row grouping">

```ts file=row-grouping-example.page.tsx
```
```ts file=columns.ts
```
</Sandpack>

In `groupBy.column` you can use any column property - so, for example, you can define a custom `renderValue` function to customize the rendering.

```tsx
const groupBy = [
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
const groupBy = [
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

For the `multi-column` strategy, you can use <PropLink name="hideEmptyGroupColumns" /> in order to hide columns for groups which are currently not visible.

<Sandpack title="Hide Empty Group Columns">

```ts file=../../reference/hideEmptyGroupColumns-example.page.tsx
```
```ts file=../../reference/employee-columns.ts as=employee-columns.ts
```

</Sandpack>

<Gotcha>

You can specify an `id` for group columns. This is helpful if you want to size those columns (via <PropLink name="columnSizing" />) or pin them (via <PropLink name="columnPinning" />) or configure them in other ways. If no `id` is specified, it will be generated like this: `"group-by-${field}"`

</Gotcha>

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


<Gotcha>

You can specify an `id` for the single group column by using <PropLink name="groupColumn" />, as detailed above. This is helpful if you want to size this column (via <PropLink name="columnSizing" />) or pin it (via <PropLink name="columnPinning" />) or configure it in other ways. If no `id` is specified, it will default to `"group-by"`.

</Gotcha>

### Inline group column

When inline group rendering is used (<PropLink name="groupRenderStrategy" code={false}>groupRenderStrategy="inline"</PropLink>), the columns bound to the corresponding group by fields are used for rendering, so no group columns are generated. This way of rendering groups is only recommended when you're sure you have small groups (smaller than the number of rows visible in the viewport).


## Aggregations

Docs coming