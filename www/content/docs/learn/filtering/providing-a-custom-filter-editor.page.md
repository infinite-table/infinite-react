---
title: Providing a Custom Filter Editor
description: Writing a custom filter editor for a column in Infinite Table is straightforward.
---

Almost certainly, our current `string` and `number` filters are not enough for you. You will definitely need to write your custom filter editor.

Fortunately, doing this is straightforward - it involves using the <HookLink name="useInfiniteColumnFilterEditor" /> hook.

The next snippet shows our implementation of the `number` filter editor:

```tsx
export function NumberFilterEditor<T>() {
  const { ariaLabel, value, setValue, className, disabled } =
    useInfiniteColumnFilterEditor<T>();
    
  return (
    <input
      aria-label={ariaLabel}
      type="number"
      disabled={disabled}
      value={value as any as number}
      onChange={(event) => {
        let value = isNaN(event.target.valueAsNumber)
          ? event.target.value
          : event.target.valueAsNumber;
        setValue(value as any as T);
      }}
      className={className}
    />
  );
}
```

<Note>

This `NumberFilterEditor` is configured in the `components.FilterEditor` property for the `number` filter type.

If you want to import the `NumberFilterEditor`, you can do so with the following code:

```tsx
import { components } from '@infinite-table/infinite-react';

const { NumberFilterEditor, StringFilterEditor } = components
```

</Note>

As an exercise, let's write a custom filter editor that shows a checkbox and uses that to filter the values.

First step is to define the `bool` filter type:

```tsx {6} title="Defining_the_bool_filter_type_with_one_emptyValue"
filterTypes={{
  bool: {
    label: 'Boolean',
    defaultOperator: 'eq',
    // when the filter checkbox is indeterminate state, that's mapped to `null`
    emptyValues: [null],
    operators: [
      // operators will come here
    ],
  }
}}
```

Note in the code above, we have `emptyValues: [null]` - so when the filter checkbox is in indeterminate state, it should show all the rows.

Now it's time to define the operators - more exactly, just one operator, `eq`:

```tsx {7} title="Defining_the_eq_operator"
filterTypes={{
  bool: {
    defaultOperator: 'eq',
    emptyValues: [null],
    operators: [
      {
        name: 'eq',
        label: 'Equals',
        fn: ({ currentValue, filterValue }) => currentValue === filterValue,
      },
    ],
  },
}}
```
The last part of the `bool` filter type will be to specify the `FilterEditor` component - this can be either specified as part of the filter type or as part of the operator definition (each operator can override the `components.FilterEditor`).

```tsx {6} title="Specifying_the_FilterEditor_component"
filterTypes={{
  bool: {
    defaultOperator: 'eq',
    emptyValues: [null],
    components: {
      FilterEditor: BoolFilterEditor,
      FilterOperatorSwitch: () => null,
    },
    operators: [
      {
        name: 'eq',
        label: 'Equals',
        fn: ({ currentValue, filterValue }) =>
          currentValue === filterValue,
      },
    ],
  },
}}
```


Now it's time to write the actual `BoolFilterEditor` that the `bool` filter type is using:

```tsx {9} title="BoolFilterEditor"
import {
  components,
  useInfiniteColumnFilterEditor,
} from '@infinite-table/infinite-react';

const { CheckBox } = components;

function BoolFilterEditor() {
  const { value, setValue, className } = useInfiniteColumnFilterEditor<Developer>();
  return (
    <div className={className} style={{ textAlign: 'center' }}>
      <CheckBox
        checked={value}
        onChange={(newValue) => {
          if (value === true) {
            // after the value was true, make it go to indeterminate state
            newValue = null;
          }
          if (value === null) {
            // from indeterminate, goto false
            newValue = false;
          }
          setValue(newValue);
        }}
      />
    </div>
  );
}
```

<Note>

In the snippet above, note how we're using the <HookLink name="useInfiniteColumnFilterEditor" /> hook to get the current `value` of the filter and also to retrieve the `setValue` function that we need to call when we want to update filtering.

</Note>

<Sandpack title="Writing a `bool` filter type with a custom filter editor">

<Description>

The `canDesign` column is using a custom `bool` filter type with a custom filter editor.

</Description>

```ts file="checkbox-filter-editor-example.page.tsx"
```

</Sandpack>