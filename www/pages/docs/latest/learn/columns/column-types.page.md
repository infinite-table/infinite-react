---
title: Column Types
description: Column types are blueprints for generalizing column configuration and code reuse.
---

Column types allow you to specify common properties for multiple columns easily. Things like <PropLink name="columnTypes.minWidth">minWidth</PropLink>, <PropLink name="columnTypes.maxWidth">maxWidth</PropLink>, <PropLink name="columnTypes.defaultFlex">defaultFlex</PropLink> and <PropLink name="columnTypes.header">header</PropLink> are all available. For a full list, see <PropLink>columnTypes</PropLink> reference.

You specify the type of a column via the <PropLink name="columns.type">column.type</PropLink> property:

```tsx
type Person = {
  name: string;
  dob: string;
  age: number;
}
const columns = {
  age: {
    field: 'age',
    type: 'custom',
  },
  date: {
    field: 'dob',
    // will be type default
  },
  name: {
    field: 'name',
    // will have both of those types
    type: ['default', 'custom']
  }
}

const columnTypes = {
  default: {
    width: 200
  },
  custom: {
    align: 'center'
  }
}

<InfiniteTable columnTypes={columnTypes} columns={columns} />
```

<Note>

Properties defined in a column have precedence over the properties defined in the <PropLink code={false} name="columnTypes">type</PropLink>.

Also, if a column has no <PropLink name="columns.type">type</PropLink> specified, it will default to the `default` type. If you don't want a column to have the `default` type, use <PropLink name="columns.type">column.type=null</PropLink> or <PropLink name="columns.type">column.type=[]</PropLink>

The column <PropLink name="columns.type">type</PropLink> property can be an array - in this case, types are applied in the order they are specified, later types overriding properties of earlier ones. If the `default` type is not specified in the array, it will not be applied to the column - if you want to apply it as well, use <PropLink name="columns.type">type=['default', 'any', 'other', 'types', 'after']</PropLink>

</Note>

## Column Type properties order and precedence

When a column has multiple column types, they are applied in order, from left to right, with later types overriding properties of earlier ones - think of the behavior as very similar to `Object.assign`.

Assume a column has the following types:

```tsx

const columns = {
  salary: {
    type: ['number', 'currency']
  }
}

const numberFormatter = new Intl.NumberFormat()
const columnTypes = {
  number: {
    renderValue: ({ value }) => numberFormatter.format(value) // makes 12345 render as 12,345
  },
  currency: {
    renderValue: ({ value }) => `USD: ${value}` // makes 12345 render as USD: 12345
  }
}
```

<Note>

Although the `salary` column has both the `number` and `currency` types, and both those types have the `renderValue` property defined, only the `currency` `renderValue` function will be called. In other words, the rendering is not piped from one column type to the next. This is applied for all properties, like `render`, `style`, etc.

The `renderValue` function (and other similar functions) has access to the `column` object, so you can manually access all the column types.

</Note>