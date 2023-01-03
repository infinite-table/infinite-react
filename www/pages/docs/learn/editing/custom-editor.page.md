---
title: Custom Editor
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

```tsx {2} title=CustomEditor.tsx
const CustomEditor = () => {
  const { initialValue, confirmEdit, cancelEdit } = useInfiniteColumnEditor();

  const domRef = React.useRef<HTMLInputElement>(null);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key } = event;
    if (key === 'Enter' || key === 'Tab') {
      confirmEdit(domRef.current?.value + 'ABC');
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


<Sandpack title="Using a custom editor">

<Description>

In this example, the `salary` column is configured with a custom editor component.

</Description>


```ts file=custom-editor-example.page.tsx
```

</Sandpack>