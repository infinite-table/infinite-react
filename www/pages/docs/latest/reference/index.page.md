---
title: Infinite Table Reference
layout: API
---

<Note>
Infinite Table Props will come here
</Note>

## className

## rowStyle

The `rowStyle` prop can be either an object (typed as `React.CSSProperties`) or a function

### rowStyle as a function 

<APIAnatomy>

<AnatomyStep title="data can be null">

When Infinite Table will call `rowStyle`, the `data` property can be null - this is the case for grouped rows.

</AnatomyStep>

<AnatomyStep title="return a style object or undefined">

You can either return a valid style object, or undefined.

</AnatomyStep>


```tsx  [[1, 4, "data: Employee | null;"], [2,9,"{ background: 'tomato' };"]]
const rowStyle: InfiniteTablePropRowStyle<Employee> = ({
  data,
}: {
  data: Employee | null;
}) => {
  const salary = data ? data.salary : 0;

  if (salary > 150_000) {
    return { background: 'tomato' };
  }
};
```
</APIAnatomy>