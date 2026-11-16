---
title: Custom Editor
description: Writing a custom editor for a inline editing in Infinite Table for React
vue:
  description: Writing a custom editor for inline editing in Infinite Table for Vue
---

<FrameworkContent framework="react">

For writing a custom editor, you can use the <HookLink name="useInfiniteColumnEditor" /> hook.

</FrameworkContent>

<FrameworkContent framework="vue">

For writing a custom editor, you can use the <HookLink name="useInfiniteColumnEditor" /> composable.

</FrameworkContent>

For any column (or <PropLink name="columnTypes" code={false}>column type</PropLink> - which can then get applied to multiple columns), you can specify a custom editor component to be used for editing the column's value, via the <PropLink name="columns.components.Editor">column.components.Editor</PropLink> property.

```tsx file="custom-editor.snippet.tsx" region="intro" neutral
```

<FrameworkContent framework="react">

The editor component should use the <HookLink name="useInfiniteColumnEditor"/> hook to have access to cell-related information and to confirm, cancel or reject the edit.

```tsx file="custom-editor.snippet.tsx" region="customeditor-tsx" title="CustomEditor.tsx"
```

<Note>

Inside any custom editor component, you can use the <HookLink name="useInfiniteColumnCell"/> hook to get access to the cell-related information.

</Note>

</FrameworkContent>

<FrameworkContent framework="vue">

The editor component should call the <HookLink name="useInfiniteColumnEditor"/> composable in its `setup`, to have access to cell-related information and to confirm, cancel or reject the edit. The composable returns a plain object, not refs: the editor is created when the edit starts, and `initialValue` is the value the edit starts with.

```tsx file="custom-editor.snippet.tsx" region="customeditor-tsx" title="CustomEditor.ts"
```

<Note>

Inside any custom editor component, you can use the <HookLink name="useInfiniteColumnCell"/> composable to get access to the cell-related information. It returns a ref.

</Note>

</FrameworkContent>

<DemoDescription>

In this example, the `salary` column is configured with a custom editor component.

</DemoDescription>

```tsx file="custom-editor-example.demo.tsx" title="Using a custom editor"
```

## Using Custom Date Editors

<FrameworkContent framework="react">

A common use-case is integrating date editors, so in the following example we'll use the [MUI X Date Picker](https://mui.com/x/react-date-pickers/date-picker/) component.

</FrameworkContent>

<FrameworkContent framework="vue">

A common use-case is integrating date editors. The following example uses the [MUI X Date Picker](https://mui.com/x/react-date-pickers/date-picker/), which is a React component, so it's shown in its React version. In Vue, a date editor is written like the editor above: a component that calls the <HookLink name="useInfiniteColumnEditor" /> composable and renders the date picker you already use in your project.

</FrameworkContent>

<DemoDescription>

This is a basic example integrating with the [MUI X Date Picker](https://mui.com/x/react-date-pickers/date-picker/) - click any cell in the **Birth Date** column to show the date picker.

</DemoDescription>

```tsx file="date-editor-example.demo.tsx" height="large" title="Using MUI X Date Picker for editing dates in the DataGrid"
```
