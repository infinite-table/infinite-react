---
title: Dynamic Pivoting Example
---

This example showcases client-side grouping, pivoting and aggregation.
These properties are changed dynamically at run-time via the UI.

It also showcases different way of customizing columns based on dynamic conditions:

- uses custom `number` and `currency` column types, to format values
- has a custom border for rows that have `canDesign=yes`
- the custom column type `number` has a background color based on the color input

<Sandpack deps="react-select" viewMode="preview" size="lg">

```tsx files=["dynamic-advanced-pivoting-example.page.tsx","Settings.tsx","types.ts"]

```

</Sandpack>

## Server-side Dynamic Pivoting Example

This example is very similar with the above one, but pivoting, grouping and aggregation is done on the server-side.

<Sandpack viewMode="preview" size="lg">

```tsx files=["dynamic-pivoting-serverside-example.page.tsx","Settings.tsx","types.ts"]

```

</Sandpack>
