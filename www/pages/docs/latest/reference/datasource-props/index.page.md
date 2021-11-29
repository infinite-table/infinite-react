---
title: DataSource Props
layout: API
---

In the API Reference below we'll use **`DATA_TYPE`** to refer to the TypeScript type that represents the data the component is bound to.

<PropTable>

<Prop name="data" type="DATA_TYPE[]|Promise<DATA_TYPE[]|() => DATA_TYPE[]|Promise<DATA_TYPE[]>">

> Specifies the data the component is bound to. Can be one of the following:
 * an array of the bound type - eg: `Employee[]`
 * a Promise tha resolves to an array like the above
 * a function that returns an any of the above


<Sandpack title="Data loading example with promise">

```ts file=data-example.page.tsx
```
</Sandpack> 


<Note>

It's important to note you can re-fetch data by changing the reference you pass as the `data` prop to the `<DataSource/>` component. Passing another `data` function, will cause the component to re-execute the function and thus load new data.

</Note>

<Sandpack title="Re-fetching data"> 

```ts file=../../learn/data-handling/refetch-example.page.tsx
```
```ts file=../../learn/data-handling/columns.ts as=columns.ts
```

</Sandpack>

</Prop>

<Prop name="groupRowsBy">

> An array of objects with `field` properties, that control how rows are being grouped.

Each item in the array can have the following properties:
 * field - `keyof DATA_TYPE`
 * column - config object for the group <PropLink name="column">column</PropLink>.

<Sandpack>

```ts file=groupRowsBy-example.page.tsx
```
```ts file=columns.ts
```
</Sandpack>

</Prop>

</PropTable> 

