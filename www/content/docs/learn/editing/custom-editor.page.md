---
title: Custom Editor
description: Writing a custom editor for a inline editing in Infinite Table for React
---

For writing a custom editor, you can use the <HookLink name="useInfiniteColumnEditor" /> hook.

For any column (or <PropLink name="columnTypes" code={false}>column type</PropLink> - which can then get applied to multiple columns), you can specify a custom editor component to be used for editing the column's value, via the <PropLink name="columns.components.editor">column.components.editor</PropLink> property.

```tsx file="custom-editor.snippet.tsx" region="intro"
```

The editor component should use the <HookLink name="useInfiniteColumnEditor"/> hook to have access to cell-related information and to confirm, cancel or reject the edit.

```tsx file="custom-editor.snippet.tsx" region="customeditor-tsx" title="CustomEditor.tsx"
```

<Note>

Inside any custom editor component, you can use the <HookLink name="useInfiniteColumnCell"/> hook to get access to the cell-related information.

</Note>

<DemoTitle>Using a custom editor</DemoTitle>
<DemoDescription>

In this example, the `salary` column is configured with a custom editor component.

</DemoDescription>

```tsx file="custom-editor-example.demo.tsx"
```

## Using Custom Date Editors

A common use-case is integrating date editors, so in the following example we'll use the [MUI X Date Picker](https://mui.com/x/react-date-pickers/date-picker/) component.

<DemoTitle>Using MUI X Date Picker for editing dates in the DataGrid</DemoTitle>
<DemoDescription>

This is a basic example integrating with the [MUI X Date Picker](https://mui.com/x/react-date-pickers/date-picker/) - click any cell in the **Birth Date** column to show the date picker.

</DemoDescription>

```tsx file="date-editor-example.demo.tsx" height="large"
```
