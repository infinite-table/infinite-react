---
title: Common Issues
description: Avoid common pitfalls and issues when using the component. Learn how to use it properly to perform smooth and avoid jank.
vue: true
---

As people have started using `<InfiniteTable />` we've noticed a few issues keep popping up.

While we're trying to refine our API to be easier to use and understand, developers using the component still need to be aware of some design decisions and conventions used in the component.

## Issue: Performance degradation because props are new on every render

Passing new props on every render to the `<InfiniteTable />` component or to the `<DataSource />` component can be a performance bottleneck:

```ts file="index.snippet.tsx" region="issue-performance-degradation-because-props-are"
```

<FrameworkContent framework="react">

Instead pass the **same** reference when things do change - stored in state or any other place:

</FrameworkContent>

<FrameworkContent framework="vue">

Here `groupField` is a `ref`. The array is created again every time the component renders, so the `<DataSource />` receives a new `groupBy` and groups the data again, even when `groupField` has not changed. Props are compared by reference, so the same goes for any array or object that is built in the template from reactive state.

Instead, keep the value in a `ref`, or build it in a `computed`, so the same reference is passed until the value really changes:

</FrameworkContent>

```ts file="index.snippet.tsx" region="issue-performance-degradation-stable-props"
```

<FrameworkContent framework="react">

<Note>

When in dev mode, you can set `localStorage.debug = "*"` in your localstorage to see potential issues logged to the console.

For example, you might see:

`InfiniteTable:rerender Triggered by new values for the following props +1s columns`

</Note>

</FrameworkContent>

## Issue: State inside custom components rendered in cells is lost while scrolling

<FrameworkContent framework="react">

When using custom rendering or custom components for columns, make sure all your rendering logic is [controlled](https://reactjs.org/docs/forms.html#controlled-components) and that it doesn't have any local or transient state.

</FrameworkContent>

<FrameworkContent framework="vue">

When using custom rendering or custom components for columns, make sure your rendering logic doesn't have any local or transient state (a `ref` created in the `setup` of a custom component, for example) - what a cell renders should come from the cell information, or from state that lives outside the cell.

</FrameworkContent>

This is important because `InfiniteTable` makes heavy use of virtualization, in both _column cells and column headers_, so **custom components can and will be unmounted and re-mounted multiple times**, during the virtualization process (triggered by user scrolling, sorting, filtering and a few other interactions).

<FrameworkContent framework="vue">

A component can also be kept and reused for another row - after sorting, for example - and then its local state shows up in the wrong row.

</FrameworkContent>
