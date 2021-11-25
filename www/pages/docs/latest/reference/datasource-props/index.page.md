---
title: DataSource Props
layout: API
---

In the API Reference below we'll use **`DATA_TYPE`** to refer to the TypeScript type that represents the data the component is bound to.

<PropTable>

<Prop name="data">

> The data array or promise resolving to array, backing the DataSource and the table component. Can also be a function that returns an array or a promise.

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

