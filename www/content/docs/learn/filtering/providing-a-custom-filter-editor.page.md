---
title: Providing a Custom Filter Editor
description: Writing a custom filter editor for a column in Infinite Table is straightforward.
vue: true
angular: true
---

Almost certainly, our current `string` and `number` filters are not enough for you. You will definitely need to write your custom filter editor.

<FrameworkContent framework="react">

Fortunately, doing this is straightforward - it involves using the <HookLink name="useInfiniteColumnFilterEditor" /> hook.

</FrameworkContent>

<FrameworkContent framework="vue">

Fortunately, doing this is straightforward - it involves using the <HookLink name="useInfiniteColumnFilterEditor" /> composable.

</FrameworkContent>

<FrameworkContent framework="angular">

Fortunately, doing this is straightforward - it involves writing a component that uses the <HookLink name="useInfiniteColumnFilterEditor" /> inject function.

</FrameworkContent>

The next snippet shows our implementation of the `number` filter editor:

```tsx file="providing-a-custom-filter-editor.snippet.tsx" region="intro"
```

<Note>

This `NumberFilterEditor` is configured in the `components.FilterEditor` property for the `number` filter type.

If you want to import the `NumberFilterEditor`, you can do so with the following code:

```tsx file="providing-a-custom-filter-editor.built-in-editors.snippet.tsx" region="built-in-editors"
```

</Note>

As an exercise, let's write a custom filter editor that shows a checkbox and uses that to filter the values.

First step is to define the `bool` filter type:

```tsx file="providing-a-custom-filter-editor.snippet.tsx" region="defining-the-bool-filter-type-with-one" title="Defining the bool filter type with one emptyValue"
```

Note in the code above, we have `emptyValues: [null]` - so when the filter checkbox is in indeterminate state, it should show all the rows.

Now it's time to define the operators - more exactly, just one operator, `eq`:

```tsx file="providing-a-custom-filter-editor.snippet.tsx" region="defining-the-eq-operator" title="Defining the eq operator"
```

The last part of the `bool` filter type will be to specify the `FilterEditor` component - this can be either specified as part of the filter type or as part of the operator definition (each operator can override the `components.FilterEditor`).

```tsx file="providing-a-custom-filter-editor.snippet.tsx" region="specifying-the-filtereditor-component" title="Specifying the FilterEditor component"
```

<FrameworkContent framework="angular">

`components.FilterEditor` is a function that returns what to render - for a component, `renderComponent(BoolFilterEditor)`. The component is created with the injector of the filter cell, so it can use <HookLink name="useInfiniteColumnFilterEditor" />.

</FrameworkContent>

Now it's time to write the actual `BoolFilterEditor` that the `bool` filter type is using:

```tsx file="providing-a-custom-filter-editor.boolfiltereditor.snippet.tsx" region="boolfiltereditor" title="BoolFilterEditor"
```

<FrameworkContent framework="react">

<Note>

In the snippet above, note how we're using the <HookLink name="useInfiniteColumnFilterEditor" /> hook to get the current `value` of the filter and also to retrieve the `setValue` function that we need to call when we want to update filtering.

</Note>

</FrameworkContent>

<FrameworkContent framework="vue">

<Note>

In the snippet above, note how we're using the <HookLink name="useInfiniteColumnFilterEditor" /> composable to get the current `value` of the filter and also to retrieve the `setValue` function that we need to call when we want to update filtering.

`value` is a ref: read `value.value` inside the render function, so the editor is updated when the filter changes.

</Note>

</FrameworkContent>

<FrameworkContent framework="angular">

<Note>

In the snippet above, note how we're using the <HookLink name="useInfiniteColumnFilterEditor" /> inject function to get the current `value` of the filter and also to retrieve the `setValue` function that we need to call when we want to update filtering.

`value` is a signal: read it in the template (`editor.value()`), so the editor is updated when the filter changes.

</Note>

</FrameworkContent>

<DemoTitle>Writing a `bool` filter type with a custom filter editor</DemoTitle>
<DemoDescription>

The `canDesign` column is using a custom `bool` filter type with a custom filter editor.

</DemoDescription>

```tsx file="checkbox-filter-editor-example.demo.tsx"
```
