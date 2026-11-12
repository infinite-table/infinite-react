---
title: Disabled Rows
---

Disabling rows allows you to have some rows that are not selectable, not clickable, not reacheable via keyboard navigation and other interactions.

The `DataSource` manages the disabled state of rows, via the <DPropLink name="defaultRowDisabledState" /> (uncontrolled) prop and <DPropLink name="rowDisabledState" /> (controlled) prop.

```tsx file="disabled-rows.snippet.tsx" region="intro"
```

<Note>

In addition to using the <DPropLink name="defaultRowDisabledState" />/<DPropLink name="rowDisabledState" /> props, you can also specify the <DPropLink name="isRowDisabled" /> function prop, which overrides those other props and ultimately determines whether a row is disabled or not.

</Note>

```tsx file="initialRowDisabledState-example.demo.tsx" title="Specify some rows as initially disabled"
```

## Using disabled rows while rendering

When rendering a cell, you have access to the row disabled state - the <TypeLink name="InfiniteTableRowInfo" /> type has a `rowDisabled` property which is true if the row is disabled.

<DemoTitle>Using the row disabled state while rendering</DemoTitle>
<DemoDescription>

This example uses custom rendering for the `firstName` column to render an emoji for disabled rows.

</DemoDescription>

```tsx file="custom-rendering-for-disabled-rows-example.demo.tsx"
```

## Using the API to enable/disable rows

You can use the `DataSourceApi` to enable or disable rows programmatically.

<DApiLink name="setRowEnabled" />

```tsx file="disabled-rows.snippet.tsx" region="using-the-api-to-enable-disable-rows"
```

<DApiLink name="setRowEnabledAt" />

```tsx file="disabled-rows.snippet.tsx" region="set-row-enabled-at"
```

<DemoTitle>Using the API to enable/disable rows</DemoTitle>
<DemoDescription>

Use the context menu on each row to toggle the disabled state of the respective row.

</DemoDescription>

```tsx file="using-api-to-disable-rows-example.demo.tsx"
```