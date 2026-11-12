---
title: Master Detail - Collapsing and Expanding Rows
description: Learn how to use master-detail and configure the state of the row details as expanded or collapsed
---

You can control the collapsed/expanded state of rows in the master-detail configuration.

By default, all row details are collapsed. You can very easily change this by using the <PropLink name="defaultRowDetailState" /> prop.

```tsx file="collapsing-and-expanding-rows.snippet.tsx" region="specyfing-the-default-row-detail-state" title="Specyfing the default row detail state"
```

<DemoTitle>Master detail DataGrid with some row details expanded by default</DemoTitle>
<DemoDescription>

Some of the rows in the master DataGrid are expanded by default.

Also, we have a default sort defined, by the `country` and `city` columns.

</DemoDescription>

```tsx file="master-detail-default-expanded-example.demo.tsx" height="large"
```

## Understanding and defining the collapse/expand state for row details

When you want to specify a different collapse/expand state of the row details (since by default they are all collapsed, and you might want to expand some of them), you need to use the <PropLink name="defaultRowDetailState" /> prop, or its controlled counterpart - the <PropLink name="rowDetailState" /> prop.

The <TypeLink name="RowDetailState" code={false}>row detail state</TypeLink> can be defined in two ways:

- either specify `collapsedRows: true` (which means all rows are collapsed by default) and specify an array of `expandedRows`, which will contain the ids of the rows that should be rendered as expanded.

```tsx file="collapsing-and-expanding-rows.snippet.tsx" region="understanding-and-defining-the-collapse-expand"
```

- or specify `expandedRows: true` (which means all rows are expanded by default) and specify an array of `collapsedRows`, which will contain the ids of the rows that should be rendered as collapsed.

```tsx file="collapsing-and-expanding-rows.snippet.tsx" region="understanding-and-defining-the-collapse-expand-2"
```

You can pass these objects into either the <PropLink name="defaultRowDetailState" /> (uncontrolled) or the <PropLink name="rowDetailState" /> (controlled).

<Note>

If you're using the controlled <PropLink name="rowDetailState" /> prop, you'll need to respond to user interaction by listening to <PropLink name="onRowDetailStateChange" /> and updating the value of <PropLink name="rowDetailState" /> accordingly.

</Note>

<Note>

As an alternative to using the object literals as specified above, you can import the `RowDetailState` class from `@infinite-table/infinite-react` and use it to define the state of the row details. You can pass instances of `RowDetailState` into the <PropLink name="defaultRowDetailState" /> or <PropLink name="rowDetailState" /> props.

```tsx file="collapsing-and-expanding-rows.snippet.tsx" region="passing-an-instance-of-rowdetailstate-to-the" title="Passing an instance of RowDetailState to the InfiniteTable"
```

```tsx file="collapsing-and-expanding-rows.snippet.tsx" region="passing-an-object-literal-to-the-infinitetable" title="Passing an object literal to the InfiniteTable"
```

See our type definitions for <TypeLink name="RowDetailState" code={false}>more details on row detail state</TypeLink>.

</Note>

<DemoTitle>Master detail DataGrid with listener for row expand/collapse</DemoTitle>
<DemoDescription>

Some of the rows in the master DataGrid are expanded by default.

We use the controlled <PropLink name="rowDetailState" /> prop to manage the state of the row details and update it by using <PropLink name="onRowDetailStateChange" />.

</DemoDescription>

```tsx file="master-detail-controlled-expanded-enhanced-example.demo.tsx" height="large"
```

## Listening to row detail state changes

In order to be notified when the collapse/expand state of row details changes, you can use the <PropLink name="onRowDetailStateChange" /> prop.

<Note>

This function is called with only one argument - the new <PropLink name="rowDetailState" />. Please note this is an instance of <TypeLink name="RowDetailState"/>. If you want to use the object literal, make sure you call `getState()` on the instance of `RowDetailState`.

```tsx file="collapsing-and-expanding-rows.snippet.tsx" region="using-the-onrowdetailstatechange-listener" title="Using the onRowDetailStateChange listener"
```

</Note>

When using the controlled <PropLink name="rowDetailState" />, you'll need to respond to the user interaction by using the <PropLink name="onRowDetailStateChange"/> listener, in order to update the controlled <PropLink name="rowDetailState" />.

This allows you to manage the state of the row details yourself - making it easy to expand/collapse all rows, or to expand/collapse a specific row by simply updating the value of the <PropLink name="rowDetailState" /> prop.

```tsx file="collapsing-and-expanding-rows.snippet.tsx" region="listening-to-row-detail-state-changes"
```

<Note>

If you prefer the more imperative approach, you can still use the [Row Detail API](/docs/reference/row-detail-api) to <RowDetailApiLink name="expandRowDetail">expand</RowDetailApiLink> or <RowDetailApiLink name="collapseRowDetail">collapse</RowDetailApiLink> details for rows.

</Note>


## Single row expand

Using the controlled <PropLink name="rowDetailState" /> prop is very powerful - it allows you to configure the expand state to only allow one row to be expanded at a time, if that's something you need.

This means that if any other row(s) are expanded and you expand a new row, the previously expanded rows will all be collapsed.


<DemoTitle>Master detail only one row expanded at a time</DemoTitle>
<DemoDescription>

In this demo we allow only one row to be expanded at any given time.

We use the controlled <PropLink name="rowDetailState" /> prop to manage the state of the row details and update it by using <PropLink name="onRowDetailStateChange" />.

</DemoDescription>

```tsx file="master-detail-one-expanded-row-example.demo.tsx" height="large"
```