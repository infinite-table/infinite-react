---
title: Styling Rows
---

Rows can be styled by using the `rowStyle` and the `rowClassName` props

- <PropLink name="rowStyle">rowStyle</PropLink> can be a style `object` or a `function` that returns a style `object` or `undefined`
- <PropLink name="rowClassName"/> can be a `string` (the name of a CSS class) or a `function` that returns a `string` or `undefined`

```tsx title=Defining-a-rowStyle-function
const rowStyle: InfiniteTablePropRowStyle<Employee> = ({ data }) => {
  // data could be undefined for group rows, so we are using the nullish coalescing operator
  const salary = data?.salary ?? 0;

  if (salary > 150_000) {
    return { background: "tomato" };
  }
};
```

## Row styling example

<Sandpack>

```ts file=row-styling-example.page.tsx
```
```ts file=columns.ts
```

</Sandpack>
