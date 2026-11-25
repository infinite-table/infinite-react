---
title: Column Editors
description: Learn how to use configure editors for columns in Infinite Table
vue: true
angular: true
---

For now, Infinite Table comes with a default built-in editor that's rendered when editing starts on any editable cell.

It's very easy to configure columns with your own custom editors via the <PropLink name="columns.components.Editor" /> property.

```tsx file="column-editors.snippet.tsx" region="intro" neutral
```

<Note title="No built-in custom editors!">

For now, we're not shipping any extra editors with Infinite Table.

There are a few reasons for that:

- we want to keep our bundle size small
- we're aware people have their own preferences - especially **select/combo boxes** and **date pickers** are very complex components on their own and there are many different popular alternatives many teams already use in their projects

So in this page and other parts of the docs, we'll use some popular alternatives, to show how to integrate them with Infinite Table.

</Note>

## Using Date Editors

<FrameworkContent framework="react">

A common use-case is integrating date editors, so in the following example we'll use the [MUI X Date Picker](https://mui.com/x/react-date-pickers/date-picker/) component.

</FrameworkContent>

<FrameworkContent framework="vue">

A common use-case is integrating date editors. The following example uses the [MUI X Date Picker](https://mui.com/x/react-date-pickers/date-picker/), which is a React component, so it's shown in its React version. In Vue, a date editor is a [custom editor](/docs/learn/editing/custom-editor) like any other: a component that calls the <HookLink name="useInfiniteColumnEditor" /> composable and renders the date picker you already use in your project.

</FrameworkContent>

<FrameworkContent framework="angular">

A common use-case is integrating date editors. The following example uses the [MUI X Date Picker](https://mui.com/x/react-date-pickers/date-picker/), which is a React component, so it's shown in its React version. In Angular, a date editor is a [custom editor](/docs/learn/editing/custom-editor) like any other: a component that calls <HookLink name="useInfiniteColumnEditor" /> and renders the date picker you already use in your project (or a native `<input type="date">`).

</FrameworkContent>

<DemoDescription>

This is a basic example integrating with the [MUI X Date Picker](https://mui.com/x/react-date-pickers/date-picker/) - click any cell in the **Birth Date** column to show the date picker.

</DemoDescription>

```tsx file="date-editor-example.demo.tsx" height="large" title="Using MUI X Date Picker for editing dates in the DataGrid"
```

## Configure Editors for Column Types

When you have more than one column that needs to use the same editor, you can use the <PropLink name="columnTypes" code={false}>column types</PropLink> and associate the editor with the column type.

After defining your generic column types, make sure you assign them to the columns that need that specific type

<DemoDescription>

This is a basic example integrating with the [MUI X Date Picker](https://mui.com/x/react-date-pickers/date-picker/) - click any cell in the **Birth Date** or **Date Hired** columns to show the date picker.

This example uses the <PropLink name="columnTypes" code={false}>column types</PropLink> to give each date column the same editor and styling.

</DemoDescription>

```tsx file="column-types-date-editor-example.demo.tsx" height="large" title="Using MUI X Date Picker with custom 'date' type columns"
```
