---
title: Handling Date Objects
description: Learn how to display, manipulate and render dates with Infinite Table
---

InfiniteTable can handle dates just like any other data type - make sure you specify <PropLink name="columns.type" code={false}>type="date"</PropLink> for date columns.

If your date column does not specify a custom <PropLink name="columns.valueFormatter" code={false}>formatter</PropLink> or <PropLink code={false} name="columns.renderValue">renderer</PropLink>, by default the date will be formatted using the [`toLocaleDateString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString) method of the date object.

<Note>

For date columns, make sure you specify <PropLink name="columns.type">column.type="date"</PropLink>.

This will ensure that the column is sorted correctly (as per the available <DPropLink name="sortTypes"/>) and that the default date formatting is applied.

</Note>


<Sandpack title="Using date objects">

<Description>

In this example, the `birthDate` column contains dates and we customized the way they are displayed.

```tsx
const renderValue = ({ value }: { value: Date }) => {
  return <b>{value.toISOString().split('T')[0]}</b>
}
```

If no custom `renderValue` was specified, the dates would have been formatted using the `Date.toLocaleDateString()`
</Description>

```ts file="dates-with-local-data-example.page.tsx"

```

</Sandpack>

## Using date strings


<Note>

If your dates are not `instanceof Date` but strings or numbers (timestamps) then it's better not to use the <PropLink name="columns.type">column.type="date"</PropLink> but rather to specify a custom <PropLink name="columns.type">column.type</PropLink> along with <DPropLink name="sortTypes"/>.
</Note>

For the case when your dates are not actually dates, but date strings (the same applies to timestamps), you have to define your sorting function.

```tsx
const sortTypes = {
  mydatestring: (a: string, b: string) => {
    // use your preferred date parsing library
    // to turn a string into date and then compare the two values
    return new Date(a).getTime() - new Date(b).getTime();
  },
};

```

When then pass the <DPropLink name="sortTypes"/> to the `<DataSource />` component and configure our date column to be of type `"mydatestring"` (it should match the key you specified in your `sortTypes` definition).


<Sandpack title="Using date strings">

<Description>

In this example, the `birthDate` column contains dates as strings, so we have to define a custom column.type and sort type.

</Description>

```ts file="date-strings-with-local-data-example.page.tsx"

```

</Sandpack>
