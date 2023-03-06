---
title: Column Styling
description: Styling columns in the InfiniteTable React DataGrid via both style and className properties.
---

## Using the column `style`

The most straightforward way to style the cells in a column is to use the <PropLink name="columns.style">column.style</PropLink> property as an object.

```ts title=Styling_a_column_in_the_DataGrid

const column = {
  firstName: {
    style: {
      color: 'red',
      fontWeight: 'bold',
    },
  }
}
```

<Sandpack title="Using column.style as an object">

```tsx file=column-style-object-example.page.tsx

```

</Sandpack>

The <PropLink name="columns.style">column.style</PropLink> property can either be an object (of type `React.CSSProperties`) or a function that returns an object (of the same type).


Using functions for the <PropLink name="columns.style">column.style</PropLink> property allows you to style the cells based on the cell's value or other properties.

```ts {6} title=Styling_a_column_using_a_style_function
const columns = {
  salary: {
    field: 'salary',
    type: 'number',
    style: ({ value, data, column, rowInfo }) => {
      return {
        color: value && value > 100_000 ? 'red' : 'tomato',
      };
    },
  },
}
```
<Sandpack title="Using column.style as a function">

```tsx file=column-style-fn-example.page.tsx
```

</Sandpack>

<Note>

If defined as a function, the <PropLink name="columns.style">column.style</PropLink> accepts an object as a parameter, which has the following properties:

- `column` - the current column where the style is being applied
- `data` - the data object for the current row. The type of this object is `DATA_TYPE | Partial<DATA_TYPE> | null`. For regular rows, it will be of type `DATA_TYPE`, while for group rows it will be `Partial<DATA_TYPE>`. For rows not yet loaded (because of batching being used), it will be `null`.
- `rowInfo` - the information about the current row - see [Using RowInfo](/docs/learn/rows/using-row-info) for more details.
- `value` - the underlying value of the current cell - will generally be `data[column.field]`, if the column is bound to a `field` property

</Note>

## Using the column `className`

Mirroring the behavior already described for the <PropLink name="columns.style">column.style</PropLink> property, the <PropLink name="columns.className">column.className</PropLink> property can be used to apply a CSS class to the cells in a column.

It can be used as a string or a function that returns a string.

```ts title=Styling_a_column_using_column.className
const columns = {
  firstName: {
    className: 'first-name-column',
  },
}
```

<Sandpack title="Using column.className as an string">

```tsx file=column-className-string-example.page.tsx
```
```css file=coloring.module.css
```

</Sandpack>


Using functions for the <PropLink name="columns.className">column.className</PropLink> property allows you to style the cells based on the cell's data/value/rowInfo etc.

```ts {6} title=Styling_a_column_using_a_className_function
const columns = {
  salary: {
    field: 'salary',
    type: 'number',
    className: ({ value, data, column, rowInfo }) => {
      return value && value > 100_000 ? 'red-color' : 'tomato-color',
    },
  },
}
```

<Sandpack title="Using column.className as a function">

```tsx file=column-className-fn-example.page.tsx
```
```css file=coloring.module.css
```

</Sandpack>