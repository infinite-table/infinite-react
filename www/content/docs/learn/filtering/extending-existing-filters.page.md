---
title: Extending existing filters
description: Learn how to extend existing filters and filter types for your Infinite Table React DataGrid
---

By default `InfiniteTable` has the following default filter types:

 - `string`
 - `number`

and each of them has a collection of operators that are supported - see <DPropLink name="filterTypes" /> for the respective list of supported operators.

You may find those operators limiting - but it's easy to extend them and add new operators or even new filter types.


## Adding new operators to existing filter types

You can import `defaultFilterTypes` from the root of the package.

```ts title="Adding a new operator to the string filter type"
import { defaultFilterTypes } from '@infinite-table/infinite-react';

// add new operators for the `string` filter type
defaultFilterTypes.string.operators.push({
  name: 'notContains',
  component: { Icon: ReactComponentForIcon }
  label: 'Not Contains',
  fn: ({currentValue, filterValue }) => {
    return typeof currentValue === 'string' &&
            typeof filterValue == 'string' &&
            !currentValue.toLowerCase().includes(filterValue.toLowerCase())
  }
})
```

<Note>

When you import the named `defaultFilterTypes` value and extend it, that will affect all `InfiniteTable` components in your application.

If you don't want that, you need to use the `filterTypes` prop of the `<DataSource />` component. Either build an entirely new object for `filterTypes`, or start by cloning `defaultFilterTypes` and extend it.

</Note>

<Sandpack title="Enhanced string filter type - new 'Not includes' operator">

<Description>

The `string` columns have a new `Not includes` operator.

</Description>

```ts file="customised-default-filter-types-example.page.tsx"
```

</Sandpack>

## Adding new filter types

If the existing filter types are not enough, it's easy to add new ones.

As already mentioned, you can either update the value of `defaultFilterTypes` or use the `filterTypes` prop of the `<DataSource />` component. Updating the value `defaultFilterTypes` will affect all your `InfiniteTable` DataGrid components.


```ts title="Adding a new filter type by updating defaultFilterTypes"

import { defaultFilterTypes } from '@infinite-table/infinite-react';

defaultFilterTypes.bool = {
  defaultOperator: 'eq',
  emptyValues: [null],
  operators: [
    {
      name: 'eq',
      label: 'Equals',
      fn: ({ currentValue, filterValue }) =>
        currentValue === filterValue,
    },
  ],
}
```


```ts title="Adding a new filter type by using the filterTypes prop"

import { DataSource} from '@infinite-table/infinite-react';

<DataSource
  filterTypes={{
    bool: {
      defaultOperator: "eq",
      emptyValues: [null],
      operators: [
        {
          name: "eq",
          label: "Equals",
          fn: ({ currentValue, filterValue }) => currentValue === filterValue,
        },
      ],
    },
  }}
/>;

```

<Note>

When passing `filterTypes` to the `<DataSource />` component, the object will be merged with the `defaultFilterTypes`. As a result, the existing `string` and `number` filterTypes will be preserved, unless explicitly overridden.

</Note>

<Sandpack title="Writing a `bool` filter type with a custom filter editor">

<Description>

The `canDesign` column is using a custom `bool` filter type with a custom filter editor.

</Description>

```ts file="checkbox-filter-editor-example.page.tsx"
```

</Sandpack>