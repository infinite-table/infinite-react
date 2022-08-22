---
title: Infinite Hooks
layout: API
---


<PropTable>

<Prop name="useInfiniteColumnCell" >

> Used inside <PropLink name="columns.render" /> or <PropLink name="column.components.ColumnCell" />

```ts
import { useInfiniteColumnCell } from '@infinite-table/infinite-react'
```

For custom column header components, see related <HookLink name="useInfiniteHeaderCell" />.

When using this hook inside a <PropLink name="columns.components.ColumnCell" code={false}>custom column cell component</PropLink>, make sure you get `domRef` from the hook result and pass it on to the final `JSX.Element` that is the DOM root of the component.


```tsx
const CustomCellComponent = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef, ...other } =
    useInfiniteColumnCell<Developer>();

  return <div ref={domRef} {...props} style={{...props.style, color: 'red'}}>
    {props.children}
  </div>
}
```

You should not pass the `domRef` along when using the hook inside the
 <PropLink name="columns.render" /> or <PropLink name="columns.renderValue" /> function.

<Sandpack title="Column with render & useInfiniteColumnCell">

```tsx file=../../reference/column-render-hooks-example.page.tsx

```

</Sandpack>

</Prop>


<Prop name="useInfiniteHeaderCell" >

> Used inside <PropLink name="columns.header" /> or <PropLink name="column.components.HeaderCell" />

```ts
import { useInfiniteHeaderCell } from '@infinite-table/infinite-react'
```

For custom column cell components, see related <HookLink name="useInfiniteColumnCell" />.

When using this hook inside a <PropLink name="columns.components.HeaderCell" code={false}>custom column header component</PropLink>, make sure you get `domRef` from the hook result and pass it on to the final `JSX.Element` that is the DOM root of the component.


```tsx
const CustomHeaderComponent = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef, ...other } =
    useInfiniteHeaderCell<Developer>();

  return <div ref={domRef} {...props} style={{...props.style, color: 'red'}}>
    {props.children}
  </div>
}
```

You should not pass the `domRef` along when using the hook inside the
 <PropLink name="columns.header" /> function.

<Sandpack title="Column with custom header & useInfiniteHeaderCell">

```tsx file=../../reference/column-header-hooks-example.page.tsx

```

</Sandpack>

</Prop>

</PropTable>