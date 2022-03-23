---
title: Dynamic Pivoting Example
---

This demo shows how you can use Infinite Table api to construct a grid with grouping and pivoting defined at runtime.

It also showcases different way of customizing columns based on dynamic conditions:

- uses custom `number` and `currency` column types, to format values
- has a custom border for rows that have `canDesign=yes`
- the custom column type `number` has a background color based on the color input

<Sandpack deps="react-select">

```tsx file=dynamic-advanced-pivoting-example.page.tsx

```

</Sandpack>
