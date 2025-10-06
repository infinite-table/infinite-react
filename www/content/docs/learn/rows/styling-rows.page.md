---
title: Styling Rows
---

Rows can be styled by using the `rowStyle` and the `rowClassName` props

- the <PropLink name="rowStyle" /> prop can be a style `object` or a `function` that returns a style `object` or `undefined`
- the <PropLink name="rowClassName"/> prop can be a `string` (the name of a CSS class) or a `function` that returns a `string` or `undefined`

```tsx title="Defining-a-rowStyle-function"
const rowStyle: InfiniteTablePropRowStyle<Employee> = ({
  data,
  rowInfo,
}: {
  data: Employee | null;
  rowInfo: InfiniteTableRowInfo<Employee>;
}) => {
  const salary = data ? data.salary : 0;

  if (salary > 150_000) {
    return { background: 'tomato' };
  }
  if (rowInfo.indexInAll % 10 === 0) {
    return { background: 'lightblue', color: 'black' };
  }
};
```

<Note>

The <PropLink name="rowClassName" /> function prop has the same signature as the <PropLink name="rowStyle" /> function prop.

</Note>

## Row styling example

<Sandpack>

```ts files=["$DOCS/reference/rowStyle-example.page.tsx","$DOCS/reference/rowStyle-example-columns.ts"]

```

</Sandpack>

<Note>

In the <PropLink name="rowStyle" /> function, you can access the rowInfo object, which contains information about the current row. It's especially useful when you have grouping and aggregation, as it contains the aggregation values and other extra info.

</Note>
