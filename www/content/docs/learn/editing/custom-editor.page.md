---
title: Custom Editor
description: Writing a custom editor for a inline editing in Infinite Table for React
---

For writing a custom editor, you can use the <HookLink name="useInfiniteColumnEditor" /> hook.

For any column (or <PropLink name="columnTypes" code={false}>column type</PropLink> - which can then get applied to multiple columns), you can specify a custom editor component to be used for editing the column's value, via the <PropLink name="columns.components.editor">column.components.editor</PropLink> property.

```tsx {10}
const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    defaultEditable: false,
  },
  firstName: {
    field: 'firstName',
    components: {
      // this is using a custom editor component
      editor: CustomEditor,
    },
  },
  age: {
    field: 'age',
    type: 'number',
    defaultEditable: false,
  },
  stack: { field: 'stack' },
  currency: { field: 'currency' },
};
```

The editor component should use the <HookLink name="useInfiniteColumnEditor"/> hook to have access to cell-related information and to confirm, cancel or reject the edit.

```tsx {3} title="CustomEditor.tsx"
import { useInfiniteColumnEditor } from '@infinite-table/infinite-react'
const CustomEditor = () => {
  const { initialValue, confirmEdit, cancelEdit } = useInfiniteColumnEditor();

  const domRef = React.useRef<HTMLInputElement>(null);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key } = event;
    if (key === 'Enter' || key === 'Tab') {
      confirmEdit(domRef.current?.value );
    } else if (key === 'Escape') {
      cancelEdit();
    } else {
      event.stopPropagation();
    }
  }, []);

  return (
    <div>
      <input
        style={{ width: '100%' }}
        autoFocus
        ref={domRef}
        defaultValue={initialValue}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};
```

<Note>

Inside any custom editor component, you can use the <HookLink name="useInfiniteColumnCell"/> hook to get access to the cell-related information.

</Note>


<Sandpack title="Using a custom editor" >

<Description>

In this example, the `salary` column is configured with a custom editor component.

</Description>


```ts file="custom-editor-example.page.tsx"
```

</Sandpack>


## Using Custom Date Editors

A common use-case is integrating date editors, so in the following example we'll use the [MUI X Date Picker](https://mui.com/x/react-date-pickers/date-picker/) component.

<Sandpack size="lg" title="Using MUI X Date Picker for editing dates in the DataGrid" deps="@emotion/react,@emotion/styled,@mui/material,@mui/x-date-pickers,dayjs">

<Description>

This is a basic example integrating with the [MUI X Date Picker](https://mui.com/x/react-date-pickers/date-picker/) - click any cell in the **Birth Date** column to show the date picker.

</Description>


```ts file="date-editor-example.page.tsx"
```

</Sandpack>
