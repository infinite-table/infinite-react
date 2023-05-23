---
title: Handling Date Objects
description: Learn how to display, manipulate and render dates with Infinite Table
---

InfiniteTable can handle dates just like any other data type, with one specification: you can't render date objects as-is, you need to specify a custom <PropLink name="columns.valueFormatter" code={false}>formatter</PropLink> or <PropLink name="columns.renderValue">renderer</PropLink>.


<Sandpack title="Using date objects">

<Description>

In this example, the `birthDate` column contains dates, so we had to specify a `renderValue` for the column:

```tsx
const renderValue = ({ value }: { value: Date }) => {
  return value.toLocaleDateString();
}
```
</Description>

```ts file="dates-with-local-data-example.page.tsx"

```

</Sandpack>